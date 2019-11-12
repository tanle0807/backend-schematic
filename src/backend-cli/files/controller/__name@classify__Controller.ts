// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';

// IMPORT CUSTOM
import { Validator } from '<%= path %>/middleware/validator/Validator';
import { VerificationJWT } from '<%= path %>/middleware/auth/VerificationJWT';
import { <%= classify(name) %> } from '<%= path %>/entity/<%= classify(name) %>';

@Controller("/<%= controller %>")
@Docs("docs_<%= docs %>")
export class <%= classify(name) %>Controller {
    constructor() {}

    // =====================INDEX=====================
    @Get('')
    @UseAuth(VerificationJWT)
    @Validator({})
    async index(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
    ) {

    }

} // END FILE
