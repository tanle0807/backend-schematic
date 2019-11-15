import { generateTemplate, toCamelCase } from "./common"
import { Source, url, Rule, Tree, apply, template, move, branchAndMerge, mergeWith } from "@angular-devkit/schematics"
import inquirer = require("inquirer");
import { strings } from "@angular-devkit/core";
import { normalize } from "path";


const askQuestionProjectName = () => {
    return inquirer.prompt({
        type: "input",
        name: "projectName",
        message: "PROJECT NAME: "
    });
}

const askQuestionProjectCode = () => {
    return inquirer.prompt({
        type: "input",
        name: "projectCode",
        message: "PROJECT CODE: "
    },);
}

const askQuestionDB = () => {
    return inquirer.prompt({
        type: "input",
        name: "dbName",
        message: "DATABASE NAME: "
    });
}
const toUppercase = (string: string) => {
    return string.toUpperCase()
}

export const initProject = async (): Promise<any> => {
    const folder = './'
    let { projectName } = await askQuestionProjectName()
    let { projectCode } = await askQuestionProjectCode()
    let { dbName } = await askQuestionDB()

    const source: Source = url("./files/init");
    const params = {
        dbName,
        projectName: toUppercase(projectName),
        projectCode
    }

    const transformedSource: Source = apply(source, [
        template({
            ...strings, // dasherize, classify, camelize, etc
            ...params
        }),
        move(normalize(folder))
    ]);

    return branchAndMerge(mergeWith(transformedSource));
}