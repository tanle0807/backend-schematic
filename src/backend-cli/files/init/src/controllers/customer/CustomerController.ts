// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, Post, BodyParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';
import { MultipartFile } from '@tsed/multipartfiles';

// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Customer } from '../../entity/Customer';
import { CustomerService } from '../../services/CustomerService';
import JWT from '../../middleware/auth/strategy/JWT';
import { AuthType } from '../../types/types';
import { hashPassword } from '../../util/passwordHelper';
import config from '../../../config';
import { CustomerInsert } from '../../entity-request/CustomerInsert';
import { CustomerUpdate } from '../../entity-request/CustomerUpdate';
import { PromotionService } from '../../services/PromotionService';

@Controller("/customer/customer")
@Docs("docs_customer")
export class CustomerController {
    constructor(
        private customerService: CustomerService,
        private promotionService: PromotionService
    ) { }

    // =====================LOGIN=====================
    @Post('/login')
    @Validator({
        phone: Joi.string().required(),
        password: Joi.string().required()
    })
    async login(
        @BodyParams('phone') phone: string,
        @BodyParams('password') password: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let user = await this.customerService.login(phone, password);
        if (!user)
            return res.sendClientError('Tài khoản hoặc mật khẩu không đúng! Vui lòng thử lại');
        if (user.isBlock)
            return res.sendClientError('Tài khoản này đã bị khoá!');
        const token = new JWT().sign({ id: user.id, type: AuthType.Customer });
        return { token };
    }


    // =====================SIGNUP=====================
    @Post('/signup')
    @Validator({
    })
    async create(
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("customer") customer: CustomerInsert,
        @BodyParams("refCode") refCode: string,
    ) {
        // Check exist phone
        const oldCustomer = await Customer.findOne({
            where: { phone: customer.phone }
        })
        if (oldCustomer) return res.sendClientError("Số điện thoại đã được sử dụng!")

        // Create new customer 
        const newCustomer = customer.toCustomer()
        newCustomer.generateCode()
        newCustomer.password = await hashPassword(newCustomer.password)

        // Check ref code
        if (refCode) {
            const parent = await Customer.findOne({
                where: { code: refCode.toUpperCase() }
            })
            if (!parent) return res.sendClientError("Mã giới thiệu không tồn tại")
            newCustomer.parent = parent
        }

        await newCustomer.save()

        if (newCustomer.parent)
            this.promotionService.handleNewRef(newCustomer)

        // Return token
        const token = new JWT().sign({ id: newCustomer.id, type: AuthType.Customer })
        return { token }
    }


    // =====================INFO=====================
    @Get('/profile')
    @UseAuth(VerificationJWT)
    async getInfo(
        @HeaderParams('token') token: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        return await Customer.findOneOrThrowId(req.customer.id);
    }


    // =====================UPDATE INFO=====================
    @Get('/profile')
    @UseAuth(VerificationJWT)
    async updateInfo(
        @HeaderParams('token') token: string,
        @BodyParams("customer") customer: CustomerUpdate,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const modifiedCustomer = customer.toCustomer()
        modifiedCustomer.id = req.customer.id
        await modifiedCustomer.save()
        return res.sendOK(modifiedCustomer)
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
        const { id } = req.customer;
        if (oldPassword == newPassword)
            return res.sendClientError('Mật khẩu mới không được trùng mật khẩu cũ');

        // Get user with old password
        const customer = await this.customerService.isValidPassword(id, oldPassword);
        if (!customer)
            return res.sendClientError('Mật khẩu cũ không đúng')

        // Update password
        customer.password = await hashPassword(newPassword);
        await customer.save();
        return res.sendOK({}, 'Cập nhật mật khẩu thành công');
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

} // END FILE
