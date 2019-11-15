"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const schematics_1 = require("@angular-devkit/schematics");
const inquirer_1 = __importDefault(require("inquirer"));
const injection_1 = require("./injection");
var Injection;
(function (Injection) {
    Injection["Pagination"] = "GET LIST WITH PAGINATION";
    Injection["FindAll"] = "GET LIST ALL";
    Injection["GetItem"] = "GET ITEM";
    Injection["CreateItem"] = "CREATE ITEM NORMAL";
    Injection["CreateItemRequest"] = "CREATE ITEM FROM ENTITY REQUEST";
})(Injection || (Injection = {}));
// =========================ASK QUESTION======================
const askQuestionInject = () => {
    return inquirer_1.default.prompt({
        type: "list",
        name: "ctlSub",
        message: "INJECT FUNCTION? ",
        choices: [
            Injection.Pagination,
            Injection.FindAll,
            Injection.GetItem,
            Injection.CreateItem,
            Injection.CreateItemRequest
        ]
    });
};
const askQuestionPagination = () => {
    return inquirer_1.default.prompt({
        type: "list",
        name: "pagination",
        message: "DO YOU WANT PAGINATION?",
        choices: ["YES" /* Yes */, "NO" /* No */]
    });
};
const askQuestionEntity = (tree) => __awaiter(this, void 0, void 0, function* () {
    const path = './src/entity-request/';
    const choices = common_1.getSubFileAndFolder(path, tree);
    // Don't have anything inside
    const { ctlSub } = yield common_1.askQuestionSubFolder(choices);
    let name = '';
    if (ctlSub == 'BACK') {
        return '';
    }
    const pieces = ctlSub.split('.');
    name = pieces[0];
    return name;
});
const askQuestionInputEntityRequest = () => {
    return inquirer_1.default.prompt({
        type: "input",
        name: "entity",
        message: "INPUT ENTITY_REQUEST: "
    });
};
// =========================CREATE TEMPLATE======================
exports.createController = (module, rawName, options) => {
    let folder = `src/${module.toLowerCase()}/`;
    let finalName = rawName;
    let finalSub = '';
    if (rawName.includes('/')) {
        const [sub, name] = rawName.split('/');
        finalSub = sub;
        folder += `${sub}/`;
        finalName = name;
    }
    const source = schematics_1.url("./files/controller");
    const params = {
        name: finalName,
        controller: `${common_1.toCamelCase(finalSub)}/${common_1.toCamelCase(finalName)}`,
        docs: finalSub,
        path: '../..'
    };
    return common_1.generateTemplate(source, options, folder, params);
};
exports.createControllerResource = (module, rawName, options) => __awaiter(this, void 0, void 0, function* () {
    const answerPagination = yield askQuestionPagination();
    // const 
    let folder = `src/${module.toLowerCase()}/`;
    let finalName = rawName;
    let finalSub = '';
    if (rawName.includes('/')) {
        const [sub, name] = rawName.split('/');
        finalSub = sub;
        folder += `${sub}/`;
        finalName = name;
    }
    const source = schematics_1.url("./files/controller_resource");
    const params = {
        name: finalName,
        controller: `${common_1.toCamelCase(finalSub)}/${common_1.toCamelCase(finalName)}`,
        docs: finalSub,
        path: '../..',
        pagination: answerPagination.pagination == "YES" /* Yes */
    };
    return common_1.generateTemplate(source, options, folder, params);
});
// =========================GENERATE FUNCTION TEMPLATE======================
const generatePaginationFunction = (name) => {
    const camel = common_1.toCamelCase(name);
    const cap = common_1.capitalize(name);
    let template = `
    // =====================GET LIST=====================
    @Get('')
    @UseAuth(VerificationJWT)
    @Validator({
        page: Joi.number().min(0),
        limit: Joi.number().min(0)
    })
    async findAll(
        @HeaderParams('token') token: string,
        @QueryParams('page') page: number,
        @QueryParams('limit') limit: number,
        @QueryParams('search') search: string = '',
        @Req() req: Request,
        @Res() res: Response
    ) {
        const [{{camel}}s, total] = await {{cap}}.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                name: Raw( alias => {{backtick}}concat({{dollar}}{ alias}, " ", phone) LIKE "%{{dollar}}{search}%"{{backtick}} ),
                // name: Like({{backtick}}% {{dollar}}{ search }%{{backtick}})
            },
            order: { id: 'DESC' }
        });

        return res.sendOK({ {{camel}}s, total });
    }
    `;
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    template = template.replace(/{{dollar}}/g, '$');
    template = template.replace(/{{backtick}}/g, '`');
    return template;
};
const generateFindAll = (name) => {
    const camel = common_1.toCamelCase(name);
    const cap = common_1.capitalize(name);
    let template = `
    // =====================GET LIST=====================
    @Get('')
    @UseAuth(VerificationJWT)
    @Validator({
        page: Joi.number().min(0),
        limit: Joi.number().min(0)
    })
    async findAll(
        @HeaderParams('token') token: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const {{camel}} = await {{cap}}.find()
        return res.sendOK({{camel}})
    }
    `;
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    return template;
};
const generateGetItem = (name) => {
    const camel = common_1.toCamelCase(name);
    const cap = common_1.capitalize(name);
    let template = `
    // =====================GET ITEM=====================
    @Get('/:{{camel}}Id')
    @UseAuth(VerificationJWT)
    @Validator({
        {{camel}}Id: Joi.number().required()
    })
    async findOne(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams('token') token: string,
        @PathParams('{{camel}}Id') {{camel}}Id: number
    ) {
        let {{camel}} = await {{cap}}.findOneOrThrowId({{camel}}Id);
        return res.sendOk({{camel}});
    }
    `;
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    return template;
};
const generateCreateItem = (name) => {
    const camel = common_1.toCamelCase(name);
    const cap = common_1.capitalize(name);
    let template = `
    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        {{camel}}: Joi.required()
    })
    async create(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams('token') token: string,
        @BodyParams('{{camel}}') {{camel}}: {{cap}}
    ) {
        await {{camel}}.save();
        return res.sendOk({{camel}})
    }
    `;
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    return template;
};
const generateCreateItemRequest = (name, entityRequest) => {
    const pieces = common_1.words(common_1.toTitleCase(entityRequest));
    pieces.pop();
    name = pieces.join('');
    const camel = common_1.toCamelCase(name);
    const cap = common_1.capitalize(name);
    let template = `
    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        {{camel}}: Joi.required()
    })
    async create(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams('token') token: string,
        @BodyParams('{{camel}}') {{camel}}: {{entityRequest}}
    ) {
        const new{{cap}} = customer.to{{cap}}();
        await new{{cap}}.save();
        return new{{cap}};
    }
    `;
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    template = template.replace(/{{entityRequest}}/g, entityRequest);
    return template;
};
// =========================INJECTION======================
const getTemplateFunction = (name, tree) => __awaiter(this, void 0, void 0, function* () {
    const answersInject = yield askQuestionInject();
    let injectString = '';
    switch (answersInject.ctlSub) {
        case Injection.Pagination:
            injectString = generatePaginationFunction(name);
            break;
        case Injection.FindAll:
            injectString = generateFindAll(name);
            break;
        case Injection.GetItem:
            injectString = generateGetItem(name);
            break;
        case Injection.CreateItem:
            injectString = generateCreateItem(name);
            break;
        case Injection.CreateItemRequest:
            let entityRequest = '';
            entityRequest = yield askQuestionEntity(tree);
            console.log('entityRequest:', entityRequest);
            if (!entityRequest) {
                const { entity } = yield askQuestionInputEntityRequest();
                if (!entity) {
                    return exports.injectController(tree);
                }
                entityRequest = entity;
            }
            injectString = generateCreateItemRequest(name, entityRequest);
            break;
    }
    return injectString;
});
exports.injectController = (tree) => __awaiter(this, void 0, void 0, function* () {
    let path = './src/controller/';
    const originPath = './src/controller/';
    let name = '';
    let done = true;
    while (done) {
        const choices = common_1.getSubFileAndFolder(path, tree);
        // Don't have anything inside
        const { ctlSub } = yield common_1.askQuestionSubFolder(choices);
        if (ctlSub == 'BACK') {
            if (path == originPath)
                return injection_1.handleInjection(tree);
            path = common_1.removeLastFolderInPath(path);
            continue;
        }
        if (ctlSub.includes('.')) {
            let [filename, extension] = ctlSub.split('.');
            filename = filename.replace('Controller', '');
            name = filename;
            path += ctlSub;
            done = false;
        }
        else {
            path += `${ctlSub}/`;
        }
    }
    // Ask which template to inject
    const injectString = yield getTemplateFunction(name, tree);
    // Done find exact file
    if (path.endsWith('/')) {
        return injection_1.handleInjection(tree);
    }
    // Read content
    const buffer = tree.read(path);
    const content = buffer ? buffer.toString() : '';
    // Update content
    const updateRecorder = tree.beginUpdate(path);
    const pattern = '} // END FILE';
    const position = content.indexOf(pattern);
    updateRecorder.insertLeft(position, `${injectString}\n`);
    tree.commitUpdate(updateRecorder);
    return tree;
});
