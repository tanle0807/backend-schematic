"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const inquirer = require("inquirer");
const core_1 = require("@angular-devkit/core");
const path_1 = require("path");
const askQuestionProjectName = () => {
    return inquirer.prompt({
        type: "input",
        name: "projectName",
        message: "PROJECT NAME: "
    });
};
const askQuestionProjectCode = () => {
    return inquirer.prompt({
        type: "input",
        name: "projectCode",
        message: "PROJECT CODE: "
    });
};
const askQuestionDB = () => {
    return inquirer.prompt({
        type: "input",
        name: "dbName",
        message: "DATABASE NAME: "
    });
};
const toUppercase = (string) => {
    return string.toUpperCase();
};
exports.initProject = () => __awaiter(this, void 0, void 0, function* () {
    const folder = './';
    let { projectName } = yield askQuestionProjectName();
    let { projectCode } = yield askQuestionProjectCode();
    let { dbName } = yield askQuestionDB();
    const source = schematics_1.url("./files/init");
    const params = {
        dbName,
        projectName: toUppercase(projectName),
        projectCode
    };
    const transformedSource = schematics_1.apply(source, [
        schematics_1.template(Object.assign({}, core_1.strings, params)),
        schematics_1.move(path_1.normalize(folder))
    ]);
    return schematics_1.branchAndMerge(schematics_1.mergeWith(transformedSource));
});
