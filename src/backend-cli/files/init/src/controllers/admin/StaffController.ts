// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';
import { Like, Raw } from 'typeorm';

// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { Staff } from '../../entity/Staff';
import { MultipartFile } from '@tsed/multipartfiles';
import config from '../../../config';
import { StaffService } from '../../services/StaffService';
import JWT from '../../middleware/auth/strategy/JWT';
import { hashPassword } from '../../util/passwordHelper';
import { AuthType } from '../../types/types';
import { Role } from '../../entity/Role';
import { StaffUpdate } from '../../entity-request/StaffUpdate';

// Admin - Staff
@Controller("/admin/staff")
@Docs("docs_admin")
export class StaffController {
    constructor(private staffService: StaffService) { }

    // =====================LOGIN=====================
    @Post('/login')
    @Validator({
        username: Joi.string().required(),
        password: Joi.string().required()
    })
    async login(
        @BodyParams('username') username: string,
        @BodyParams('password') password: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let user = await this.staffService.login(username, password);
        if (!user)
            return res.sendClientError('Tài khoản hoặc mật khẩu không đúng! Vui lòng thử lại');
        if (user.isBlock)
            return res.sendClientError('Tài khoản này đã bị khoá!');
        const token = new JWT().sign({ id: user.id, type: AuthType.Staff });
        return { token };
    }

    // =====================INFO=====================
    @Get('/profile')
    @UseAuth(VerificationJWT)
    async getInfo(@HeaderParams('token') token: string, @Req() req: Request) {
        let staff = await Staff.findOneOrThrowId(req.staff.id, {
            relations: ['role']
        });
        return staff;
    }

    // =====================UPDATE PASSWORD=====================
    @Post('/profile/password/update')
    @UseAuth(VerificationJWT)
    @Validator({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required()
    })
    async changePassword(
        @Req() req: Request,
        @BodyParams('oldPassword') oldPassword: string,
        @BodyParams('newPassword') newPassword: string,
        @HeaderParams('token') token: string,
        @Res() res: Response
    ) {
        const { id } = req.staff;
        if (oldPassword == newPassword)
            return res.sendClientError('Mật khẩu mới không được trùng mật khẩu cũ');

        // Get user with old password
        const staff = await this.staffService.isValidPassword(id, oldPassword);
        if (!staff)
            return res.sendClientError('Mật khẩu cũ không đúng')

        // Update password
        staff.password = await hashPassword(newPassword);
        await staff.save();
        return res.sendOK({}, 'Cập nhật mật khẩu thành công');
    }

    // =====================GET PERMISSION=====================
    @Get('/profile/permission')
    @UseAuth(VerificationJWT)
    async getPermission(
        @HeaderParams('token') token: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const { id } = req.staff;
        let permissions = await this.staffService.getPermission(id);
        return res.sendOK(permissions);
    }

    // =====================GET LIST STAFF=====================
    @Get('')
    @UseAuth(VerificationJWT)
    async findAll(
        @HeaderParams('token') token: string,
        @QueryParams('page') page: number,
        @QueryParams('limit') limit: number,
        @QueryParams('search') search: string = '',
        @QueryParams('isBlock') isBlock: boolean,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const where = {
            name: Raw(alias => `concat( ${alias}, " ",  phone, " ", username) LIKE "%${search}%"`),
            isBlock
        };
        if (req.query.isBlock === undefined) delete where.isBlock;

        let [staff, total] = await Staff.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where,
            relations: ['role'],
            order: { id: 'DESC' }
        });

        return res.sendOK({ data: staff, total });
    }

    // =====================GET ANOTHER STAFF INFO=====================
    @Get('/:staffId')
    @UseAuth(VerificationJWT)
    async findOne(
        @HeaderParams('token') token: string,
        @PathParams('staffId') staffId: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        return await Staff.findOneOrThrowId(staffId, { relations: ['role'] });
    }

    // =====================CREATE ADMIN=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        staff: Joi.required(),
        roleId: Joi.number().required()
    })
    async create(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams('token') token: string,
        @BodyParams('staff') staff: Staff,
        @BodyParams('roleId') roleId: number
    ) {
        //validate
        await this.staffService.checkDuplicate(staff);
        //init user to store
        staff.password = await hashPassword(staff.password);
        staff.role = new Role();
        staff.role.id = roleId;
        delete staff.id;
        await staff.save();
        return { id: staff.id };
    }

    // =====================UPDATE ADMIN INFO=====================
    @Post('/:staffId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        staff: Joi.required(),
        staffId: Joi.number().required()
    })
    async update(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams('token') token: string,
        @BodyParams('staff') staff: StaffUpdate,
        @BodyParams("roleId") roleId: number,
        @PathParams('staffId') staffId: number
    ) {
        // Validate
        await Staff.findOneOrThrowId(staffId);
        const role = await Role.findOneOrThrowId(roleId)
        //init user to store
        let newStaff = staff.toStaff();
        newStaff.id = staffId;
        newStaff.role = role
        await newStaff.save();
        return { id: newStaff.id };
    }

    // =====================RESET PASSWORD=====================
    @Post('/:staffId/password/reset')
    @UseAuth(VerificationJWT)
    @Validator({
        newPassword: Joi.string().required(),
        staffId: Joi.number().required()
    })
    async resetPassword(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams('token') token: string,
        @BodyParams('newPassword') newPassword: string,
        @PathParams('staffId') staffId: number
    ) {
        const staff = await Staff.findOneOrThrowId(staffId);
        staff.password = await hashPassword(newPassword);
        await staff.save();
        return { id: staff.id };
    }

    // =====================UPDATE ADMIN ROLE=====================
    @Post('/:staffId/update/role')
    @UseAuth(VerificationJWT)
    @Validator({
        roleId: Joi.number().required(),
        staffId: Joi.number().required()
    })
    async updateRoleAdmin(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams('token') token: string,
        @BodyParams('roleId') roleId: number,
        @PathParams('staffId') staffId: number
    ) {
        await Staff.findOneOrThrowId(staffId);
        let role = await Role.findOneOrThrowId(roleId);
        //Init user to store
        let user = new Staff();
        user.id = staffId;
        user.role = role;
        await user.save();
        return { id: user.id };
    }

    // =====================UPLOAD AVATAR=====================
    @Post('/avatar/upload')
    @UseAuth(VerificationJWT)
    uploadFile(
        @MultipartFile('avatar') file: Express.Multer.File,
        @HeaderParams('token') token: string
    ) {
        file.path = file.path.replace(config.UPLOAD_DIR, '');
        return file;
    }

} //END FILE
