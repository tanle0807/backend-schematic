// IMPORT LIBRARY
import { Service } from "@tsed/common";

// IMPORT CUSTOM
import { CoreService } from "../core/services/CoreService";
import { <%= classify(name) %> } from "../entity/<%= classify(name) %>";


@Service()
export class <%= classify(name) %>Service extends CoreService {
    constructor() { }

    public async function() {

    }
} //END FILE