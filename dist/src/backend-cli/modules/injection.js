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
const inquirer = require("inquirer");
const controller_1 = require("./controller");
const askQuestionInject = () => {
    return inquirer.prompt({
        type: "list",
        name: "injection",
        message: "YOU WANT INJECT ?",
        choices: ["CONTROLLER" /* Controller */]
    });
};
exports.handleInjection = (tree) => __awaiter(this, void 0, void 0, function* () {
    const answerInjection = yield askQuestionInject();
    switch (answerInjection.injection) {
        case "CONTROLLER" /* Controller */:
            return controller_1.injectController(tree);
        default:
            break;
    }
});
