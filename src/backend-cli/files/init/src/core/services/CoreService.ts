import { Service } from "@tsed/common";
import { TypeORMService } from "@tsed/typeorm";
import { Connection } from "typeorm";

@Service()
export class CoreService {
    public connection: Connection;

    constructor(public typeORMService: TypeORMService) { }

    $afterRoutesInit() {
        this.connection = this.typeORMService.get()
    }

}
