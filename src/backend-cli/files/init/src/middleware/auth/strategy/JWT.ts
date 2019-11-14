import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { Unauthorized } from 'ts-httpexceptions';

import AuthStrategy from './AuthStrategy';
import config from '../../../../config'
import { Staff } from '../../../entity/Staff';
import { Customer } from '../../../entity/Customer';
import { Driver } from '../../../entity/Driver';

export enum AUTH_TYPE {
    staff = "ADMIN",
    customer = "CUSTOMER",
    driver = "DRIVER"
}
export default class JWT implements AuthStrategy {

    public async auth(req: Request): Promise<any> {
        let baseUrl = req.baseUrl
        if (this.checkRouter(baseUrl, AUTH_TYPE.staff)) {
            await this.authenticateStaff(req)
            return
        }

        if (this.checkRouter(baseUrl, AUTH_TYPE.driver)) {
            await this.authenticateDriver(req)
            return
        }

        await this.authenticateCustomer(req);
    }

    private checkRouter(baseUrl: string, type: AUTH_TYPE) {
        return baseUrl.includes(`${config.PREFIX_URL}/${type.toLowerCase()}`);
    }

    private async authenticateStaff(req: Request) {
        let type = AUTH_TYPE.staff
        const { token } = <{ token: string }>req.headers
        let staffId = this.getAuthenId(token, type);

        if (!staffId)
            throw new Unauthorized("Invalid token staff!");

        const staff = await Staff.findOne({ id: staffId });
        if (!staff)
            throw new Unauthorized("Find not found this user!");

        req.staff = staff;
        req.auth_type = type
    }

    private async authenticateDriver(req: Request) {
        let type = AUTH_TYPE.driver
        const { token } = <{ token: string }>req.headers
        let driverId = this.getAuthenId(token, type);

        if (!driverId)
            throw new Unauthorized("Invalid token driver!");

        const driver = await Driver.findOne({ id: driverId });
        if (!driver)
            throw new Unauthorized("Find not found this user!");

        req.driver = driver;
        req.auth_type = type
    }

    private async authenticateCustomer(req: Request) {
        let type = AUTH_TYPE.customer
        const { token } = <{ token: string }>req.headers
        let customerId = this.getAuthenId(token, type);
        if (!customerId)
            throw new Unauthorized("Invalid token!");

        const customer = await Customer.findOne({ id: customerId });
        if (!customer)
            throw new Unauthorized("Find not found this user!");

        req.customer = customer;
        req.auth_type = type
    }

    public getAuthenId(token: string, type: AUTH_TYPE): number {
        if (token) {
            try {
                const decoded = <{ id: number, type: string }>jwt.verify(token, config.JWT_SECRET)
                if (decoded.id && decoded.type == type)
                    return decoded.id
            } catch (error) {
                return 0
            }
        }
        return 0
    }

    public sign(data: Object) {
        return jwt.sign(data, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRE })
    }
}
