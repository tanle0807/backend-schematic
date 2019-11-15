import inquirer = require("inquirer");
import { Rule, SchematicContext, Tree, apply, url, template, branchAndMerge, mergeWith, Source, move, chain, UpdateRecorder } from '@angular-devkit/schematics';
import { injectController } from "./controller";

const enum Injection {
    Controller = 'CONTROLLER',
    PrivateConstructor = 'PRIVATE CONSTRUCTOR'
}

const askQuestionInject = () => {
    return inquirer.prompt({
        type: "list",
        name: "injection",
        message: "YOU WANT INJECT ?",
        choices: [Injection.Controller]
    });
};

export const handleInjection = async (tree: Tree): Promise<any> => {
    const answerInjection = await askQuestionInject()
    switch (answerInjection.injection) {
        case Injection.Controller:
            return injectController(tree)
     
        default:
            break;
    }

}