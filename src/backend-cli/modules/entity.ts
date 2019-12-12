import { words, generateTemplate, toCamelCase, toSnakeCase, removeLastFolderInPath, getSubFileAndFolder, askQuestionSubFolder, capitalize } from "./common"
import { Rule, Source, url, Tree, UpdateRecorder, chain } from "@angular-devkit/schematics"
import inquirer from 'inquirer';

export const createEntity = async (module: string, rawName: string, options: any): Promise<Rule> => {
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

export const createEntityRequest = async (module: string, rawName: string, options: any): Promise<Rule> => {
    // const 
    let folder = `src/${module.toLowerCase()}/`
    const [finalName, request] = words(toSnakeCase(rawName))

    const source: Source = url("./files/entity_request");
    const params = {
        name: finalName,
        rawName,
        path: '../..'
    }
    return generateTemplate(source, options, folder, params)
}

enum Injection {
    Computed = 'COMPUTED',
    Relation = 'RELATION'
}

enum InjectionComputed {
    GenerateCode = 'GENERATE CODE',
}


enum Relations {
    OneToMany = 'ONE TO MANY',
    ManyToOne = 'MANY TO ONE',
    ManyToMany = 'MANY TO MANY'
}

const askQuestionInject = () => {
    return inquirer.prompt({
        type: "list",
        name: "inject",
        message: "INJECT TYPE? ",
        choices: [
            Injection.Relation,
            Injection.Computed
        ]
    });
};

const askQuestionRelation = () => {
    return inquirer.prompt({
        type: "list",
        name: "relation",
        message: "SELECT RELATION? ",
        choices: [
            Relations.OneToMany,
            Relations.ManyToOne,
            Relations.ManyToMany
        ]
    });
};


const askQuestionInjectComputed = () => {
    return inquirer.prompt({
        type: "list",
        name: "inject",
        message: "INJECT COMPUTED? ",
        choices: [
            InjectionComputed.GenerateCode
        ]
    });
};

const generateCode = (name: string) => {
    const camel = toCamelCase(name)
    const cap = capitalize(name)
    let template = `
    generateCode() {
        this.code = CODE + md5({{backtick}}{{dollar}}{ moment().valueOf() }{{backtick}}).substring(0, 5).toUpperCase()
    }
    `
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    template = template.replace(/{{dollar}}/g, '$');
    template = template.replace(/{{backtick}}/g, '`');
    return template
}

const getTemplateFunction = async (name: string, _tree: Tree, _path: any) => {
    const { inject } = await askQuestionInjectComputed()
    let injectString = ''
    switch (inject) {
        case InjectionComputed.GenerateCode:
            injectString = generateCode(name)
            break;
    }
    return injectString
}

const addRelationToEntity = (path: any, tree: any, injectString: any) => {
    // Read content
    const buffer = tree.read(path);
    const content = buffer ? buffer.toString() : '';
    // Update content
    const updateRecorder: UpdateRecorder = tree.beginUpdate(path);
    const pattern = '// RELATIONS'
    const position = content.indexOf(pattern)

    updateRecorder.insertRight(position + pattern.length, `${injectString}`);
    tree.commitUpdate(updateRecorder);
    return tree
}

const injectComputed = async (tree: Tree) => {
    let path = './src/entity/'
    const originPath = './src/entity/'
    let name = ''
    let done = true

    while (done) {
        const choices = getSubFileAndFolder(path, tree)

        // Don't have anything inside
        const { ctlSub } = await askQuestionSubFolder(choices)

        if (ctlSub == 'BACK') {
            if (path == originPath) return injectEntity(tree)
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
    const injectString = await getTemplateFunction(name, tree, path)

    // Done find exact file
    if (path.endsWith('/')) {
        return injectEntity(tree)
    }

    addRelationToEntity(path, tree, injectString)
}

const askFileEntity = async (tree: Tree) => {
    let path = './src/entity/'
    let name = ''
    let done = true
    const originPath1 = './src/entity/'
    while (done) {
        const choices = getSubFileAndFolder(path, tree)

        // Don't have anything inside
        const { ctlSub } = await askQuestionSubFolder(choices)

        if (ctlSub == 'BACK') {
            if (path == originPath1) injectEntity(tree)
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
    return [path, name]
}

const handleRelation = async ({ name1, path1, name2, path2, relation, tree }: any) => {
    console.log('path2:', path2)
    let injectString1 = ''
    let injectString2 = ''

    const camel2 = toCamelCase(name2)
    const cap2 = capitalize(name2)
    const camel1 = toCamelCase(name1)
    const cap1 = capitalize(name1)

    switch (relation) {
        case Relations.OneToMany:
            injectString1 = `
            @OneToMany(type => {{cap2}}, {{camel2}}s => {{camel2}}s.{{camel1}})
            {{camel2}}s: {{cap2}}[];
            `
            injectString2 = `
            @ManyToOne(type => {{cap1}}, {{camel1}} => {{camel1}}.{{camel2}}s)
            {{camel1}}: {{cap1}};
            `
            break;

        case Relations.ManyToOne:
            injectString2 = `
            @OneToMany(type => {{cap2}}, {{camel2}}s => {{camel2}}s.{{camel1}})
            {{camel2}}s: {{cap2}}[];
            `
            injectString1 = `
            @ManyToOne(type => {{cap1}}, {{camel1}} => {{camel1}}.{{camel2}}s)
            {{camel1}}: {{cap1}};
            `
            break;

        case Relations.ManyToOne:
            injectString2 = `
            @ManyToOne(type => {{cap2}}, {{camel2}}s => {{camel2}}s.{{camel1}}s)
            {{camel2}}s: {{cap2}}[];
            `
            injectString1 = `
            @ManyToOne(type => {{cap1}}, {{camel1}}s => {{camel1}}s.{{camel2}}s)
            {{camel1}}s: {{cap1}}[];
            `
            break;
    }

    injectString1 = injectString1.replace(/{{camel1}}/g, camel1);
    injectString1 = injectString1.replace(/{{camel2}}/g, camel2);
    injectString1 = injectString1.replace(/{{cap1}}/g, cap1);
    injectString1 = injectString1.replace(/{{cap2}}/g, cap2);

    injectString2 = injectString2.replace(/{{camel1}}/g, camel1);
    injectString2 = injectString2.replace(/{{camel2}}/g, camel2);
    injectString2 = injectString2.replace(/{{cap1}}/g, cap1);
    injectString2 = injectString2.replace(/{{cap2}}/g, cap2);

    // return chain([
    addRelationToEntity(path1, tree, injectString1)
    addRelationToEntity(path2, tree, injectString2)
    // ])
}

const injectRelation = async (tree: Tree) => {
    const [path1, name1] = await askFileEntity(tree)
    const [path2, name2] = await askFileEntity(tree)

    // Done find exact file
    if (path1.endsWith('/') || path2.endsWith('/')) {
        return injectEntity(tree)
    }

    // Ask which template to inject
    const { relation } = await askQuestionRelation()
    return await handleRelation({ name1, path1, name2, path2, relation, tree })
}

export const injectEntity = async (tree: Tree): Promise<any> => {
    const { inject } = await askQuestionInject()

    if (inject == Injection.Computed) {
        injectComputed(tree)
    } else {
        return injectRelation(tree)
    }

    return tree;
}