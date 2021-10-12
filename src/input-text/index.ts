import {
    apply,
    branchAndMerge, chain, mergeWith,
    Rule,
    SchematicContext,
    SchematicsException, template,
    Tree, url,move
} from '@angular-devkit/schematics';
import { Schema } from './schema';

import { normalize, strings } from '@angular-devkit/core';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project'
import { findModuleFromOptions } from "@schematics/angular/utility/find-module";
import { addDeclarationToNgModule } from "../utils/ng-module-utils";
import { WorkspaceProject } from "@schematics/angular/utility/workspace-models";

export function inputText(_options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {

        const project = getDefaultProject(tree.read("angular.json"), _options);
        const defaultProjectPath = buildDefaultPath(project);

        if (_options.path === undefined && project) {
            _options.path = defaultProjectPath; // will return src/app if it's typical angular-cli project
        } else {
            _options.path = normalize(`${defaultProjectPath}/${_options.path}`);
        }
        _options.name = '';
        _options.module = findModuleFromOptions(tree, _options) || ''; // module path closest to the path input argument

        const {name} = parseName(defaultProjectPath, _options.path);

        _options.path = _options.path ? normalize(_options.path) : _options.path; // normalize all the Windows backslashes + more
        _options.name = name;

        return chain([
            mergeWith(apply(url('./files'), [
                template({
                    ...strings
                }),
                move(_options.path)
            ])),
            branchAndMerge(chain([

                // Call new rule
                addDeclarationToNgModule(_options, _options.export, 'input-text'),
            ]))
        ]);

    };
}

function getDefaultProject(workspaceConfigBufffer: Buffer | null, options: Schema): WorkspaceProject {
    if (!workspaceConfigBufffer) {
        throw new SchematicsException("Not an Angular CLI workspace");
    }

    const workspaceConfig = JSON.parse(workspaceConfigBufffer.toString())
    const projectName = options.project || workspaceConfig.defaultProject;

    return workspaceConfig.projects[projectName];
}
