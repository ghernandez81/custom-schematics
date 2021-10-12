import { Rule, Tree, SchematicsException } from '@angular-devkit/schematics';
import { AddToModuleContext } from './add-to-module-context';
import * as ts from 'typescript';
import { dasherize, classify } from '@angular-devkit/core/src/utils/strings';
import { ModuleOptions, buildRelativePath } from '@schematics/angular/utility/find-module';
import { addDeclarationToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';

const stringUtils = { dasherize, classify };

export function addDeclarationToNgModule(options: ModuleOptions, exports: boolean, componentName:string): Rule {
    return (host: Tree) => {
        addDeclaration(host, options, componentName);
        if (exports) {
            //addExport(host, options);
        }
        return host;
    };
}

function addDeclaration(host: Tree, options: ModuleOptions, componentName:string) {

    const context:any = createAddToModuleContext(host, options, componentName);
    const modulePath = options.module || '';

    const declarationChanges = addDeclarationToModule(
        context.source,
        modulePath,
        context.classifiedName,
        context.relativePath);

    const declarationRecorder = host.beginUpdate(modulePath);
    for (const change of declarationChanges) {
        if (change instanceof InsertChange) {
            declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
    }
    host.commitUpdate(declarationRecorder);
}

function createAddToModuleContext(host: Tree, options: ModuleOptions, componentName:string): AddToModuleContext {

    const result = new AddToModuleContext();

    if (!options.module) {
        throw new SchematicsException(`Module not found.`);
    }

    const text = host.read(options.module);
    if (text === null) {
        throw new SchematicsException(  `${options.module}does not exist.`);
    }

    const sourceText = text.toString('utf-8')
    ;
    result.source = ts.createSourceFile(options.module, sourceText, ts.ScriptTarget.Latest, true);

    result.relativePath = buildRelativePath(options.module, `${options.path}/${componentName}/${componentName}.component`);

    result.classifiedName = stringUtils.classify(`${componentName}Component`);

    return result;
}


