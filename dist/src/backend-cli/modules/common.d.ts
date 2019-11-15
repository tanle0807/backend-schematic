import { Rule, Tree, Source } from '@angular-devkit/schematics';
export declare const enum Confirm {
    Yes = "YES",
    No = "NO"
}
export declare const toCamelCase: (str: any) => any;
export declare const toKebabCase: (str: any) => any;
export declare const toTitleCase: (str: any) => any;
export declare const capitalize: ([first, ...rest]: string, lowerRest?: boolean) => string;
export declare const toSnakeCase: (str: any) => void;
export declare const words: (str: any, pattern?: RegExp) => any;
export declare const generateTemplate: (source: Source, options: any, folder: string, params: any) => Rule;
export declare function getSubFileAndFolder(folder: string, tree: Tree): any[];
export declare const askQuestionSubFolder: (choices: any[]) => any;
export declare const removeLastFolderInPath: (path: string) => string;
