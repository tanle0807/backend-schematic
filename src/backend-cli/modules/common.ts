import { Rule, SchematicContext, Tree, apply, url, template, branchAndMerge, mergeWith, Source, move, chain, UpdateRecorder } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core'; 
import inquirer from 'inquirer';

export const enum Confirm {
    Yes = 'YES',
    No = 'NO'
}

export const toCamelCase = (str: any) => {
    let s =
        str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x: any) => {
                return x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase();
            })
            .join('');
    return s.slice(0, 1).toLowerCase() + s.slice(1);
};

export const toSnakeCase = (str: any) => {
    str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map((x: any) => x.toLowerCase())
        .join('_');
}

export const words = (str: any, pattern = /[^a-zA-Z-]+/) => str.split(pattern).filter(Boolean);

export const generateTemplate = (source: Source, options: any, folder: string, params: any): Rule => {
    const transformedSource: Source = apply(source, [
        template({
            filename: options.folder,
            ...strings, // dasherize, classify, camelize, etc
            ...params
        }),
        move(normalize(folder))
    ]);

    return branchAndMerge(mergeWith(transformedSource));
}

export function getSubFileAndFolder(folder: string, tree: Tree): any[] {
    let subControllerFolder = tree.getDir(folder).subdirs
    let subControllerFile = tree.getDir(folder).subfiles
    let separatorFolder = subControllerFolder.length 
                        ? new inquirer.Separator('----------FOLDERS------------') 
                        : new inquirer.Separator('----------NO FOLDERS-----------')
    let separatorFile = subControllerFile.length 
                        ? new inquirer.Separator('-----------FILES------------')
                        : new inquirer.Separator('-----------NO FILES------------')

    return [separatorFolder, ...subControllerFolder, separatorFile, ...subControllerFile, new inquirer.Separator('-------------------------------'), 'BACK'].filter(Boolean)
}