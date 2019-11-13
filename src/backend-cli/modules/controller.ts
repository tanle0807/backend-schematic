import { generateTemplate, toCamelCase, Confirm, getSubFileAndFolder } from "./common"
import { Rule, SchematicContext, Tree, apply, url, template, branchAndMerge, mergeWith, Source, move, chain, UpdateRecorder } from '@angular-devkit/schematics';
import inquirer from 'inquirer';

enum Injection {
    Pagination = 'PAGINATION',
    FindAll = 'FIND ALL'
}

const askQuestionPagination = () => {
    return inquirer.prompt({
        type: "list",
        name: "pagination",
        message: "DO YOU WANT PAGINATION?",
        choices: [Confirm.Yes, Confirm.No]
    });
};

const askQuestionInject = () => {
    return inquirer.prompt({
        type: "list",
        name: "ctlSub",
        message: "INJECT FUNCTION? ",
        choices: [Injection.Pagination, Injection.FindAll]
    });
};

const askQuestionBack = () => {
    return inquirer.prompt({
        type: "list",
        name: "back",
        message: "DON'T HAVE EVERYTHING INSIDE! YOU WANT TO BACK?",
        choices: [Confirm.Yes, Confirm.No]
    });
}

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
        pagination: answerPagination.pagination == Confirm.Yes
    }
    return generateTemplate(source, options, folder, params)
}

const askQuestionControllerSubFolder = (choices: any[]) => {
    return inquirer.prompt({
        type: "list",
        name: "ctlSub",
        message: "INJECT TO? 1",
        choices
    });
};

const removeLastFolderInPath = (path: string): string => {
    const pieces = path.split('/')
    pieces.splice(pieces.length -2 , 1)

    console.log('pieces:', pieces)
    return pieces.join('/')
}

export const injectController = async (tree: Tree): Promise<Tree> => {
    let path = './src/controller/'
    const originPath = './src/controller/'

    let done = true
    while (done) {
        const choices = getSubFileAndFolder(path, tree)

        // Don't have anything inside
        const { ctlSub } = await askQuestionControllerSubFolder(choices)

        if (ctlSub == 'BACK') {
            if (path == originPath) return tree
            path = removeLastFolderInPath(path)
            continue
        } 
        if (ctlSub.includes('.')) {
            path += ctlSub
            done = false
        } else {
            path += `${ctlSub}/`
        }
    }

    // Done find exact file
    if (path.endsWith('/')) {
        return tree
    }

    const answersInject = await askQuestionInject()
    let injectString = ''
    switch (answersInject.ctlSub) {
        case Injection.Pagination:

            injectString = 'console.log(0)'
            break;
        case Injection.FindAll:
            injectString = 'console.log(1)'
            break;

    }

    const buffer = tree.read(path);
    const content = buffer ? buffer.toString() : '';
    
    const updateRecorder: UpdateRecorder = tree.beginUpdate(path);
    const pattern = '} // END FILE'
    const position = content.indexOf(pattern)
    updateRecorder.insertLeft(position, `\n\t${injectString}\n\n`);
    tree.commitUpdate(updateRecorder);

    return tree;
}