import { generateTemplate, toCamelCase, Confirm, getSubFileAndFolder, capitalize, words, toKebabCase, toTitleCase, askQuestionSubFolder, removeLastFolderInPath } from "./common"
import { Rule, SchematicContext, Tree, apply, url, template, branchAndMerge, mergeWith, Source, move, chain, UpdateRecorder } from '@angular-devkit/schematics';
import inquirer from 'inquirer';
import { handleInjection } from './injection';

enum Injection {
    Pagination = 'GET LIST WITH PAGINATION',
    FindAll = 'GET LIST ALL',
    GetItem = 'GET ITEM',
    CreateItem = 'CREATE ITEM NORMAL',
    CreateItemRequest = 'CREATE ITEM FROM ENTITY REQUEST',
    Delete = 'DELETE'
}

enum GetList {
    Pagination = 'PAGINATION',
    FindAll = 'ALL',
}

// =========================ASK QUESTION======================
const askQuestionInject = () => {
    return inquirer.prompt({
        type: "list",
        name: "ctlSub",
        message: "INJECT FUNCTION? ",
        choices: [
            Injection.Pagination,
            Injection.FindAll,
            Injection.GetItem,
            Injection.CreateItem,
            Injection.CreateItemRequest,
            Injection.Delete
        ]
    });
};

const askQuestionPagination = () => {
    return inquirer.prompt({
        type: "list",
        name: "pagination",
        message: "GET LIST WITH",
        choices: [GetList.Pagination, GetList.FindAll]
    });
};

const askQuestionEntity = async (tree: Tree) => {
    const path = './src/entity-request/'
    const choices = getSubFileAndFolder(path, tree)
    // Don't have anything inside
    const { ctlSub } = await askQuestionSubFolder(choices)
    let name = ''
    if (ctlSub == 'BACK') {
        return ''
    }
    const pieces = ctlSub.split('.')
    name = pieces[0]
    return name
}

const askQuestionInputEntityRequest = () => {
    return inquirer.prompt({
        type: "input",
        name: "entity",
        message: "INPUT ENTITY_REQUEST: "
    });
}

// =========================CREATE TEMPLATE======================
export const createController = (module: string, rawName: string, options: any): Rule => {
    let folder = `src/${module.toLowerCase()}/`
    let finalName = rawName
    let finalSub = ''
    if (rawName.includes('/')) {
        const [sub, name] = rawName.split('/')
        finalSub = sub
        folder += `${sub}/`
        finalName = name
    }
    const source: Source = url("./files/controller");
    const params = {
        name: finalName,
        controller: `${toCamelCase(finalSub)}/${toCamelCase(finalName)}`,
        docs: finalSub,
        path: '../..'
    }
    return generateTemplate(source, options, folder, params)
}

export const createControllerResource = async (module: string, rawName: string, options: any): Promise<Rule> => {
    const answerPagination = await askQuestionPagination()

    // const 
    let folder = `src/${module.toLowerCase()}/`
    let finalName = rawName
    let finalSub = ''
    if (rawName.includes('/')) {
        const [sub, name] = rawName.split('/')
        finalSub = sub
        folder += `${sub}/`
        finalName = name
    }
    const source: Source = url("./files/controller_resource");
    const params = {
        name: finalName,
        controller: `${toCamelCase(finalSub)}/${toCamelCase(finalName)}`,
        docs: finalSub,
        path: '../..',
        pagination: answerPagination.pagination == GetList.Pagination
    }
    return generateTemplate(source, options, folder, params)
}

// =========================GENERATE FUNCTION TEMPLATE======================
const generatePaginationFunction = (name: string) => {
    const camel = toCamelCase(name)
    const cap = capitalize(name)
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
    `
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    template = template.replace(/{{dollar}}/g, '$');
    template = template.replace(/{{backtick}}/g, '`');
    return template
}

const generateFindAll = (name: string) => {
    const camel = toCamelCase(name)
    const cap = capitalize(name)
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
    `
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    return template
}

const generateGetItem = (name: string) => {
    const camel = toCamelCase(name)
    const cap = capitalize(name)
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
    `
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    return template
}

const generateCreateItem = (name: string) => {
    const camel = toCamelCase(name)
    const cap = capitalize(name)
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
    `
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    return template
}

const generateCreateItemRequest = (name: string, entityRequest: string) => {
    const pieces = words(toTitleCase(entityRequest))
    pieces.pop()
    name = pieces.join('')
    const camel = toCamelCase(name)
    const cap = capitalize(name)
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
    `
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    template = template.replace(/{{entityRequest}}/g, entityRequest);
    return template
}

const generateDelete = (name: string) => {
    const camel = toCamelCase(name)
    const cap = capitalize(name)
    let template = `
    // =====================DELETE=====================
    @Post('/:{{camel}}Id/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
        @PathParams("{{camel}}Id") {{camel}}Id: number,
    ) {
        let {{camel}} = await {{cap}}.findOneOrThrowId({{camel}}Id)
        await {{camel}}.remove()
        return res.sendOk({{camel}})
    }
    `
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    return template
}
// =========================INJECTION======================

const getTemplateFunction = async (name: string, tree: Tree) => {
    const answersInject = await askQuestionInject()
    let injectString = ''
    switch (answersInject.ctlSub) {
        case Injection.Pagination:
            injectString = generatePaginationFunction(name)
            break;
        case Injection.FindAll:
            injectString = generateFindAll(name)
            break;
        case Injection.GetItem:
            injectString = generateGetItem(name)
            break;
        case Injection.CreateItem:
            injectString = generateCreateItem(name)
            break;
        case Injection.CreateItemRequest:
            let entityRequest = ''
            entityRequest = await askQuestionEntity(tree)
            console.log('entityRequest:', entityRequest)
            if (!entityRequest) {
                const { entity } = await askQuestionInputEntityRequest()
                if (!entity) {
                    return injectController(tree)
                }
                entityRequest = entity
            }
            injectString = generateCreateItemRequest(name, entityRequest)
            break;
        case Injection.Delete:
            injectString = generateDelete(name)
            break;
    }
    return injectString
}

export const injectController = async (tree: Tree): Promise<Tree> => {
    let path = './src/controller/'
    const originPath = './src/controller/'
    let name = ''
    let done = true

    while (done) {
        const choices = getSubFileAndFolder(path, tree)

        // Don't have anything inside
        const { ctlSub } = await askQuestionSubFolder(choices)

        if (ctlSub == 'BACK') {
            if (path == originPath) return handleInjection(tree)
            path = removeLastFolderInPath(path)
            continue
        }
        if (ctlSub.includes('.')) {
            let [filename, extension] = ctlSub.split('.')
            filename = filename.replace('Controller', '')
            name = filename
            path += ctlSub
            done = false
        } else {
            path += `${ctlSub}/`
        }
    }

    // Ask which template to inject
    const injectString = await getTemplateFunction(name, tree)

    // Done find exact file
    if (path.endsWith('/')) {
        return handleInjection(tree)
    }


    // Read content
    const buffer = tree.read(path);
    const content = buffer ? buffer.toString() : '';
    // Update content
    const updateRecorder: UpdateRecorder = tree.beginUpdate(path);
    const pattern = '} // END FILE'
    const position = content.indexOf(pattern)
    updateRecorder.insertLeft(position, `${injectString}\n`);
    tree.commitUpdate(updateRecorder);

    return tree;
}