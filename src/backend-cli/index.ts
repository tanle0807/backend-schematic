import { Rule, SchematicContext, Tree, apply, url, template, branchAndMerge, mergeWith, Source, move, chain, UpdateRecorder } from '@angular-devkit/schematics';
import inquirer from 'inquirer';
import { createController, createControllerResource } from './modules/controller'
import { createEntity, createEntityRequest } from './modules/entity';
import { createService } from './modules/service';
import { handleInjection } from './modules/injection';
import { initProject } from './modules/init';

export const enum Confirm {
    Yes = 'YES',
    No = 'NO'
}

const enum Controller {
    Resource = 'RESOURCE',
    Normal = 'NORMAL'
}

const enum Module {
    Controller = 'CONTROLLERS',
    Entity = 'ENTITY',
    EntityRequest = 'ENTITY-REQUEST',
    Service = 'SERVICES',
    ControllerEntityService = 'CONTROLLER + ENTITY + SERVICE',
    InitProject = 'INIT PROJECT',
    Inject = 'INJECT'
}

const askQuestionModule = () => {
    return inquirer.prompt({
        type: "list",
        name: "module",
        message: "CREATE MODULE?",
        choices: [
            Module.Controller,
            Module.Entity, 
            Module.EntityRequest, 
            Module.Service, 
            Module.ControllerEntityService, 
            Module.InitProject,
            Module.Inject
        ]
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

const askQuestionResource = () => {
    return inquirer.prompt({
        type: "list",
        name: "resource",
        message: "CREATE CONTROLLER RESOURCE?",
        choices: [Confirm.Yes, Confirm.No]
    });
};

const askQuestionController = () => {
    return inquirer.prompt({
        type: "list",
        name: "controller",
        message: "CREATE CONTROLLER?",
        choices: [Controller.Resource, Controller.Normal]
    });
};

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function backendCli(options: any): any {
    return async (tree: Tree, _context: SchematicContext) => {
        
        const answerModule = await askQuestionModule()
        let answerFile = null

        switch (answerModule.module) {
            case Module.Controller:
                answerFile = await askQuestionFile()
                const { controller } = await askQuestionController()
                if (controller == Controller.Resource) {
                    return createControllerResource(Module.Controller, answerFile.name, options)
                } else {
                    return createController(Module.Controller, answerFile.name, options)
                }

                
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
            case Module.Inject:
                return await handleInjection(tree)
            case Module.InitProject:
                return await initProject()
        }
        
    };
}
