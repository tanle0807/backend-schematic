import { words, generateTemplate, toCamelCase, toSnakeCase } from "./common"
import { Rule, Source, url } from "@angular-devkit/schematics"

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