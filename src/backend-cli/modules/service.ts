import { Rule, Source, url, Tree, UpdateRecorder } from "@angular-devkit/schematics"
import { toCamelCase, generateTemplate, getSubFileAndFolder, askQuestionSubFolder, removeLastFolderInPath, capitalize } from "./common"
import { handleInjection } from "./injection"
import inquirer = require("inquirer")

export const createService = async (module: string, rawName: string, options: any): Promise<Rule> => {
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

enum Injection {
    Last30 = 'GET LAST 30',
}

const askQuestionInject = () => {
    return inquirer.prompt({
        type: "list",
        name: "ctlSub",
        message: "INJECT FUNCTION? ",
        choices: [
            Injection.Last30
        ]
    });
};

const askQuestionFile = () => {
    return inquirer.prompt({
        name: "entity",
        type: "input",
        message: `WHICH ENTITY GET LAST 30
: `
    });
}

const generateLast30Function = (name: string) => {
    const camel = toCamelCase(name)
    const cap = capitalize(name)
    const upper = name.toUpperCase()
    let template = `
    // =====================GET LAST 30 {{upper}}=====================
    async get{{cap}}Last30(from: Date = null, to: Date = null) {
        let { start, end } = getThisMonthInterval()
        if (from && to) {
            const dateFrom = convertFullDateToInt(from)
            start = dateFrom.start
            const dateTo = convertFullDateToInt(to)
            end = dateTo.end
        }

        const {{camel}} = await {{cap}}.find({
            where: {
                dateCreated: Between(start, end),
            },
            order: { dateCreated: "ASC" },
        })

        const {{camel}}GroupByDay = {}
        {{camel}}.map(order => {
            const date = convertIntToDDMMYY(order.dateCreated)
            if (!{{camel}}GroupByDay[date]) {
                {{camel}}GroupByDay[date] = 0
            }
            {{camel}}GroupByDay[date] += 1
        })

        const reports = []
        for (const date in {{camel}}GroupByDay) {
            reports.push({
                date,
                total: {{camel}}GroupByDay[date],
            })
        }

        return reports
    }
    `
    template = template.replace(/{{camel}}/g, camel);
    template = template.replace(/{{cap}}/g, cap);
    template = template.replace(/{{upper}}/g, upper);
    template = template.replace(/{{dollar}}/g, '$');
    template = template.replace(/{{backtick}}/g, '`');
    return template
}

const getTemplateFunction = async (_name: string) => {
    const answersInject = await askQuestionInject()
    let injectString = ''
    switch (answersInject.ctlSub) {
        case Injection.Last30:
            const { entity } = await askQuestionFile()
            injectString = generateLast30Function(entity)
            break;
    }
    return injectString
}

const updateContentClass = (path: any, tree: any, injectString: any) => {
    // Read content
    const buffer = tree.read(path);
    const content = buffer ? buffer.toString() : '';
    // Update content
    const updateRecorder: UpdateRecorder = tree.beginUpdate(path);
    const pattern = '} //END FILE'
    const position = content.indexOf(pattern)
    updateRecorder.insertLeft(position, `${injectString}\n`);
    tree.commitUpdate(updateRecorder);
}

export const injectService = async (tree: Tree): Promise<Tree> => {
    let path = './src/services/'
    const originPath = './src/services/'
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
    const injectString = await getTemplateFunction(name)

    // Done find exact file
    if (path.endsWith('/')) {
        return handleInjection(tree)
    }

    updateContentClass(path, tree, injectString)

    return tree;
}