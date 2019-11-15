import { Rule } from '@angular-devkit/schematics';
export declare const createController: (module: string, rawName: string, options: any) => Rule;
export declare const createControllerResource: (module: string, rawName: string, options: any) => Promise<Rule>;
export declare const injectController: (tree: import("@angular-devkit/schematics/src/tree/interface").Tree) => Promise<import("@angular-devkit/schematics/src/tree/interface").Tree>;
