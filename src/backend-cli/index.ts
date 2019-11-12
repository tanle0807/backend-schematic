import { Rule, SchematicContext, Tree, apply, url, template, branchAndMerge, mergeWith, Source, move, chain } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import inquirer from 'inquirer';

const enum Confirm {
    Yes = 'YES',
    No = 'NO'
}

const enum Module {
    Controller = 'CONTROLLER',
    ControllerResource = 'CONTROLLER RESOURCE',
    Entity = 'ENTITY',
    EntityRequest = 'ENTITY_REQUEST',
    Service = 'SERVICE',
    ControllerEntityService = 'CONTROLLER + ENTITY + SERVICE'
}

const toCamelCase = (str: any) => {
    let s =
        str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x: any) => {
                return x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase();
            })
            .join('');
    return s.slice(0, 1).toLowerCase() + s.slice(1);
};

const toSnakeCase = (str: any) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x: any) => x.toLowerCase())
    .join('_');

const words = (str: string, pattern = /[^a-zA-Z-]+/) => str.split(pattern).filter(Boolean);

const askQuestionModule = () => {
    return inquirer.prompt({
        type: "list",
        name: "module",
        message: "CREATE MODULE?",
        choices: [Module.Controller, Module.ControllerResource, Module.Entity, Module.EntityRequest, Module.Service, Module.ControllerEntityService]
    });
};


const askQuestionFile = () => {
    return inquirer.prompt({
        name: "name",
        type: "input",
        message: `INPUT NAME (EX: 'User', 'admin/Page',...)
: `
    });
}

const askQuestionPagination = () => {
    return inquirer.prompt({
        type: "list",
        name: "pagination",
        message: "DO YOU WANT PAGINATION?",
        choices: [Confirm.Yes, Confirm.No]
    });
};

const askQuestionResource = () => {
    return inquirer.prompt({
        type: "list",
        name: "resource",
        message: "CREATE CONTROLLER RESOURCE?",
        choices: [Confirm.Yes, Confirm.No]
    });
};

const generateTemplate = (source: Source, options: any, folder: string, params: any): Rule => {
    console.log('params:', params)
    const transformedSource: Source = apply(source, [
        template({
            filename: options.folder,
            ...strings, // dasherize, classify, camelize, etc
            ...params
        }),
        move(normalize(folder))
    ]);

    // const transformedSource: Source = apply(source, [
    //     move(normalize(options.folder))
    // ]);
    // const templateSource = apply(
    //     transformedSource,
    //     [
    //         template({
    //             ...strings,
    //             ...options,
    //             name: 'hello'
    //         }),
    //     ]
    // );
    // console.log('answers:', answers)
    // // tree.create('admin/hello.js', 'console.log()')
    return branchAndMerge(mergeWith(transformedSource));
}

const createController = (module: string, rawName: string, options: any): Rule => {
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

const createControllerResource = async (module: string, rawName: string, options: any): Promise<Rule> => {
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
        pagination: answerPagination.pagination == Confirm.Yes
    }
    return generateTemplate(source, options, folder, params)
}

const createService = async (module: string, rawName: string, options: any): Promise<Rule> => {
    let folder = `src/${module.toLowerCase()}/`
    let finalName = rawName
    let finalSub = ''
    if (rawName.includes('/')) {
        const [sub, name] = rawName.split('/')
        finalSub = sub
        finalName = name
    }
    const source: Source = url("./files/service");
    const params = {
        name: finalName,
        controller: `${toCamelCase(finalSub)}/${toCamelCase(finalName)}`,
        docs: finalSub,
        path: '../..'
    }
    return generateTemplate(source, options, folder, params)
}

const createEntity = async (module: string, rawName: string, options: any): Promise<Rule> => {
    // const 
    let folder = `src/${module.toLowerCase()}/`
    let finalName = rawName
    let finalSub = ''
    if (rawName.includes('/')) {
        const [sub, name] = rawName.split('/')
        finalSub = sub
        finalName = name
    }
    const source: Source = url("./files/entity");
    const params = {
        name: finalName,
        controller: `${toCamelCase(finalSub)}/${toCamelCase(finalName)}`,
        docs: finalSub,
        path: '../..'
    }
    return generateTemplate(source, options, folder, params)
}

const createEntityRequest = async (module: string, rawName: string, options: any): Promise<Rule> => {
    // const 
    let folder = `src/${module.toLowerCase()}/`

    console.log('words(toSnakeCase(rawName)):', words(toSnakeCase(rawName)))
    const [finalName, request] = words(toSnakeCase(rawName))
    
    const source: Source = url("./files/entity_request");
    const params = {
        name: finalName,
        rawName,
        path: '../..'
    }
    return generateTemplate(source, options, folder, params)
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function backendCli(options: any): any {
    return async (_tree: Tree, _context: SchematicContext) => {
        
        const answerModule = await askQuestionModule()
        let answerFile = null

        switch (answerModule.module) {
            case Module.Controller:
                answerFile = await askQuestionFile()
                return createController(Module.Controller, answerFile.name, options)

            case Module.ControllerResource:
                answerFile = await askQuestionFile()
                return createControllerResource(Module.Controller, answerFile.name, options)
                
            case Module.Entity:
                answerFile = await askQuestionFile()
                return createEntity(Module.Entity, answerFile.name, options)
                
            case Module.EntityRequest:
                answerFile = await askQuestionFile()
                return createEntityRequest(Module.EntityRequest, answerFile.name, options)

            case Module.Service:
                answerFile = await askQuestionFile()
                return createService(Module.Service, answerFile.name, options)
                
            case Module.ControllerEntityService:
                answerFile = await askQuestionFile()
                const answerResource = await askQuestionResource()
                let controllerTree = null
                if (answerResource.resource == Confirm.Yes) {
                    controllerTree = await createControllerResource(Module.Controller, answerFile.name, options)
                } else {
                    controllerTree = createController(Module.Controller, answerFile.name, options)
                }
                const entityTree = await createEntity(Module.Entity, answerFile.name, options)
                const serviceTree = await createService(Module.Service, answerFile.name, options)
                return chain([
                    controllerTree,
                    entityTree,
                    serviceTree
                ])
        }
        
    };
}
