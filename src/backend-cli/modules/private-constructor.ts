import { Tree, UpdateRecorder } from '@angular-devkit/schematics';
import inquirer from 'inquirer';
import { getSubFileAndFolder, askQuestionSubFolder, removeLastFolderInPath } from './common';
import { handleInjection } from './injection';

enum ModuleInject {
    Controller = 'CONTROLLERS',
    Entity = 'ENTITY',
    Service = 'SERVICES'
}

const askQuestionInject = () => {
    return inquirer.prompt({
        type: "list",
        name: "injection",
        message: "YOU WANT INJECT TO?",
        choices: [ModuleInject.Controller, ModuleInject.Service, ModuleInject.Service]
    });
};

export const injectPrivateConstructor = async (tree: Tree): Promise<Tree> => {
    const {injection} = await askQuestionInject()
    let path = `./src/${injection.toLowerCase()}/`
    const originPath = `./src/${injection.toLowerCase()}/`
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

    // // Done find exact file
    if (path.endsWith('/')) {
        return handleInjection(tree)
    }

    // // Ask which template to inject
    // const injectString = await getTemplateFunction(name, tree)
    const injectString = 'await getTemplateFunction(name, tree)'
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