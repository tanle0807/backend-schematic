import { Rule, SchematicContext, Tree, apply, url, template, branchAndMerge, mergeWith } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
// import inquirer from 'inquirer';

// const askQuestion = () => {
//     const questions = [{
//         type: "list",
//         name: "MODULE",
//         message: "CREATE MODULE?",
//         choices: ["CONTROLLER", "CONTROLLER_RESOURCE", "ENTITY", "ENTITY_REQUEST", 'SERVICE', 'CONTROLLER + ENTITY + SERVICE']
//     },
//     {
//         name: "FILENAME",
//         type: "input",
//         message: `INPUT NAME (EX: 'User', 'admin/Page',...)
// -s ........... init CRUD controller
// :`
//     }
//     ];
//     return inquirer.prompt(questions);
// }
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function backendCli(options: any): Rule {
    return async (_tree: Tree, _context: SchematicContext) => {
        const templateSource = apply(
            url('./files'),
            [
                template({
                    ...strings,
                    ...options,
                }),
            ]
        );
        // const answers = await askQuestion()
        // tree.branch()
        // console.log('answers:', answers)
        // tree.create('admin/hello.js', 'console.log()')
        return branchAndMerge(mergeWith(templateSource));
    };
}
