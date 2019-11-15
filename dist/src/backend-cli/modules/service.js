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
const common_1 = require("./common");
exports.createService = (module, rawName, options) => __awaiter(this, void 0, void 0, function* () {
    let folder = `src/${module.toLowerCase()}/`;
    let finalName = rawName;
    let finalSub = '';
    if (rawName.includes('/')) {
        const [sub, name] = rawName.split('/');
        finalSub = sub;
        finalName = name;
    }
    const source = schematics_1.url("./files/service");
    const params = {
        name: finalName,
        controller: `${common_1.toCamelCase(finalSub)}/${common_1.toCamelCase(finalName)}`,
        docs: finalSub,
        path: '../..'
    };
    return common_1.generateTemplate(source, options, folder, params);
});
