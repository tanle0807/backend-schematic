// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';
import { Like } from 'typeorm';

// IMPORT CUSTOM
import { VerificationJWT } from '<%= path %>/middleware/auth/VerificationJWT';
import { Validator } from '<%= path %>/middleware/validator/Validator';
import { <%= classify(name) %> } from '<%= path %>/entity/<%= classify(name) %>';

// <%= classify(docs) %> - <%= classify(name) %>
@Controller("/<%= controller %>")
@Docs("docs_<%= docs %>")
export class <%= classify(name) %>Controller {
    constructor() { }

    // =====================GET LIST=====================
    @Get('')
    @UseAuth(VerificationJWT)
    @Validator({
        page: Joi.number().min(0),
        limit: Joi.number().min(0)
    })
    async findAll(
        @HeaderParams("token") token: string,
        <% if (pagination) { %>@QueryParams("page") page: number,
        @QueryParams("limit") limit: number,
        @QueryParams("search") search: string = "", <% } %>@Req() req: Request,
        @Res() res: Response
    ) {
        <% if (pagination) { %>const [<%= camelize(name) %>, total] = await <%= classify(name) %>.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                name: Like(`%${search}%`),
                // name: Raw(alias => `concat( ${alias}, " ",  phone) LIKE "%${search}%"`),
            },
            order: { id: "DESC" },
        })
        return res.sendOK({ data: <%= camelize(name) %>, total }) <% } else { %>const <%= camelize(name) %> = await <%= classify(name) %>.find()
        return res.sendOK(<%= camelize(name) %>) <% } %>
    }

    // =====================GET ITEM=====================
    @Get('/:<%= camelize(name) %>Id')
    @UseAuth(VerificationJWT)
    @Validator({
        <%= camelize(name) %>Id: Joi.number().required(),
    })
    async findOne(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
        @PathParams("<%= camelize(name) %>Id")<%= camelize(name) %>Id: number,
    ) {
        const <%= camelize(name) %> = await <%= classify(name) %>.findOneOrThrowId(<%= camelize(name) %>Id)
        return res.sendOK(<%= camelize(name) %>)
    }

    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        <%= camelize(name) %>: Joi.required(),
    })
    async create(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
        @BodyParams("<%= camelize(name) %>") <%= camelize(name) %>: <%= classify(name) %>,
    ) {
        await <%= camelize(name) %>.save()
        return res.sendOK(<%= camelize(name) %>)
    }

    // =====================UPDATE ITEM=====================
    @Post('/:<%= camelize(name) %>Id/update')
    @UseAuth(VerificationJWT)
    @Validator({
        <%= camelize(name) %>: Joi.required(),
        <%= camelize(name) %>Id: Joi.number().required()
    })
    async update(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
        @BodyParams("<%= camelize(name) %>") <%= camelize(name) %>: <%= classify(name) %>,
        @PathParams("<%= camelize(name) %>Id") <%= camelize(name) %>Id: number,
    ) {
        // This will check and throw error if not exist 
        await <%= classify(name) %>.findOneOrThrowId(<%= camelize(name) %>Id)
        <%= camelize(name) %>.id = <%= camelize(name) %>Id
        await <%= camelize(name) %>.save()
        return res.sendOK(<%= camelize(name) %>)
    }

} //END FILE
