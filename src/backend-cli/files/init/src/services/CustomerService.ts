import { Service } from "@tsed/common";

import { CoreService } from "../core/services/CoreService";
import { Exception } from "ts-httpexceptions";
import { validatePassword } from "../util/passwordHelper";
import { Customer } from "../entity/Customer";

@Service()
export class CustomerService extends CoreService {

    // =====================LOGIN=====================
    public async login(phone: string, password: string): Promise<Customer> {
        //Because select password is false for config
        const customer = await Customer.findOneOrThrowOption({
            select: ["password", "id", "isBlock"],
            where: { phone },
        })
        let validate = await validatePassword(password, customer.password)
        if (!validate) return null
        return customer
    }


    // =====================IS VALID PASSWORD=====================
    public async isValidPassword(id: number, password: string): Promise<Customer> {
        //because select password is false for config
        const customer = await Customer.findOneOrThrowOption({
            select: ["password", "id"],
            where: { id }
        })
        let validate = await validatePassword(password, customer.password)
        if (!validate) return null
        return customer
    }


    // =====================CHECK DUPLICATE=====================
    async checkDuplicate(customer: Customer, userId: number = null) {
        const { phone, email } = customer
        const oldCustomer = await Customer.findOne({
            where: [
                { phone },
                { email }
            ]
        })

        if (oldCustomer && oldCustomer.id != userId) {
            let message = ""
            if (oldCustomer.phone == customer.phone) message = "Số điện thoại"
            else if (oldCustomer.email == customer.email) message = "Email"
            throw new Exception(400, `Trùng ${message} với người dùng khác`)
        }
    }

}
