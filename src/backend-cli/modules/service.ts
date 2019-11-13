import { Rule, Source, url } from "@angular-devkit/schematics"
import { toCamelCase, generateTemplate } from "./common"

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