"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const inquirer_1 = __importDefault(require("inquirer"));
const controller_1 = require("./modules/controller");
const entity_1 = require("./modules/entity");
const service_1 = require("./modules/service");
const injection_1 = require("./modules/injection");
const init_1 = require("./modules/init");
const askQuestionModule = () => {
    return inquirer_1.default.prompt({
        type: "list",
        name: "module",
        message: "CREATE MODULE?",
        choices: [
            "CONTROLLER" /* Controller */,
            "CONTROLLER RESOURCE" /* ControllerResource */,
            "ENTITY" /* Entity */,
            "ENTITY_REQUEST" /* EntityRequest */,
            "SERVICE" /* Service */,
            "CONTROLLER + ENTITY + SERVICE" /* ControllerEntityService */,
            "INIT PROJECT" /* InitProject */,
            "INJECT" /* Inject */
        ]
    });
};
const askQuestionFile = () => {
    return inquirer_1.default.prompt({
        name: "name",
        type: "input",
        message: `INPUT NAME (EX: 'User', 'admin/Page',...)
: `
    });
};
const askQuestionResource = () => {
    return inquirer_1.default.prompt({
        type: "list",
        name: "resource",
        message: "CREATE CONTROLLER RESOURCE?",
        choices: ["YES" /* Yes */, "NO" /* No */]
    });
};
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function backendCli(options) {
    return (tree, _context) => __awaiter(this, void 0, void 0, function* () {
        const answerModule = yield askQuestionModule();
        let answerFile = null;
        switch (answerModule.module) {
            case "CONTROLLER" /* Controller */:
                answerFile = yield askQuestionFile();
                return controller_1.createController("CONTROLLER" /* Controller */, answerFile.name, options);
            case "CONTROLLER RESOURCE" /* ControllerResource */:
                answerFile = yield askQuestionFile();
                return controller_1.createControllerResource("CONTROLLER" /* Controller */, answerFile.name, options);
            case "ENTITY" /* Entity */:
                answerFile = yield askQuestionFile();
                return entity_1.createEntity("ENTITY" /* Entity */, answerFile.name, options);
            case "ENTITY_REQUEST" /* EntityRequest */:
                answerFile = yield askQuestionFile();
                return entity_1.createEntityRequest("ENTITY_REQUEST" /* EntityRequest */, answerFile.name, options);
            case "SERVICE" /* Service */:
                answerFile = yield askQuestionFile();
                return service_1.createService("SERVICE" /* Service */, answerFile.name, options);
            case "CONTROLLER + ENTITY + SERVICE" /* ControllerEntityService */:
                answerFile = yield askQuestionFile();
                const answerResource = yield askQuestionResource();
                let controllerTree = null;
                if (answerResource.resource == "YES" /* Yes */) {
                    controllerTree = yield controller_1.createControllerResource("CONTROLLER" /* Controller */, answerFile.name, options);
                }
                else {
                    controllerTree = controller_1.createController("CONTROLLER" /* Controller */, answerFile.name, options);
                }
                const entityTree = yield entity_1.createEntity("ENTITY" /* Entity */, answerFile.name, options);
                const serviceTree = yield service_1.createService("SERVICE" /* Service */, answerFile.name, options);
                return schematics_1.chain([
                    controllerTree,
                    entityTree,
                    serviceTree
                ]);
            case "INJECT" /* Inject */:
                return yield injection_1.handleInjection(tree);
            case "INIT PROJECT" /* InitProject */:
                return yield init_1.initProject();
        }
    });
}
exports.backendCli = backendCli;
