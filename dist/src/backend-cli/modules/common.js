"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
const inquirer_1 = __importDefault(require("inquirer"));
exports.toCamelCase = (str) => {
    let s = str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x) => {
            return x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase();
        })
            .join('');
    return s.slice(0, 1).toLowerCase() + s.slice(1);
};
exports.toKebabCase = (str) => str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map((x) => x.toLowerCase())
        .join('-');
exports.toTitleCase = (str) => str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ');
exports.capitalize = ([first, ...rest], lowerRest = false) => {
    return first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''));
};
exports.toSnakeCase = (str) => {
    str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x) => x.toLowerCase())
            .join('_');
};
exports.words = (str, pattern = /[^a-zA-Z-]+/) => str.split(pattern).filter(Boolean);
exports.generateTemplate = (source, options, folder, params) => {
    const transformedSource = schematics_1.apply(source, [
        schematics_1.template(Object.assign({ filename: options.folder }, core_1.strings, params)),
        schematics_1.move(core_1.normalize(folder))
    ]);
    return schematics_1.branchAndMerge(schematics_1.mergeWith(transformedSource));
};
function getSubFileAndFolder(folder, tree) {
    let subControllerFolder = tree.getDir(folder).subdirs;
    let subControllerFile = tree.getDir(folder).subfiles;
    let separatorFolder = subControllerFolder.length
        ? new inquirer_1.default.Separator('----------FOLDERS------------')
        : new inquirer_1.default.Separator('----------NO FOLDERS-----------');
    let separatorFile = subControllerFile.length
        ? new inquirer_1.default.Separator('-----------FILES------------')
        : new inquirer_1.default.Separator('-----------NO FILES------------');
    return [separatorFolder, ...subControllerFolder, separatorFile, ...subControllerFile, new inquirer_1.default.Separator('-------------------------------'), 'BACK'].filter(Boolean);
}
exports.getSubFileAndFolder = getSubFileAndFolder;
exports.askQuestionSubFolder = (choices) => {
    return inquirer_1.default.prompt({
        type: "list",
        name: "ctlSub",
        message: "INJECT TO?",
        choices
    });
};
exports.removeLastFolderInPath = (path) => {
    const pieces = path.split('/');
    pieces.splice(pieces.length - 2, 1);
    return pieces.join('/');
};
