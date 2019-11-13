import { Rule, SchematicContext, Tree, apply, url, template, branchAndMerge, mergeWith, Source, move, chain, UpdateRecorder } from '@angular-devkit/schematics';
import inquirer from 'inquirer';
import { createController, createControllerResource } from './modules/controller'
import { createEntity, createEntityRequest } from './modules/entity';
import { createService } from './modules/service';
import { handleInjection } from './modules/injection';

export const enum Confirm {
    Yes = 'YES',
    No = 'NO'
}

const enum Module {
    Controller = 'CONTROLLER',
    ControllerResource = 'CONTROLLER RESOURCE',
    Entity = 'ENTITY',
    EntityRequest = 'ENTITY_REQUEST',
    Service = 'SERVICE',
    ControllerEntityService = 'CONTROLLER + ENTITY + SERVICE',
    Inject = 'INJECT'
}

const askQuestionModule = () => {
    return inquirer.prompt({
        type: "list",
        name: "module",
        message: "CREATE MODULE?",
        choices: [Module.Controller, Module.ControllerResource, Module.Entity, Module.EntityRequest, Module.Service, Module.ControllerEntityService, Module.Inject]
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

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function backendCli(options: any): any {
    return async (tree: Tree, _context: SchematicContext) => {
        
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
            case Module.Inject:
                return await handleInjection(tree)
        }
        
    };
}
