/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
export const EXTENSIONS_DIRECTORY_NAME = path.join('.qwen', 'extensions');
export const EXTENSIONS_CONFIG_FILENAME = 'qwen-extension.json';
export const EXTENSIONS_CONFIG_FILENAME_OLD = 'gemini-extension.json';
export function loadExtensions(workspaceDir) {
    const allExtensions = [
        ...loadExtensionsFromDir(workspaceDir),
        ...loadExtensionsFromDir(os.homedir()),
    ];
    const uniqueExtensions = new Map();
    for (const extension of allExtensions) {
        if (!uniqueExtensions.has(extension.config.name)) {
            uniqueExtensions.set(extension.config.name, extension);
        }
    }
    return Array.from(uniqueExtensions.values());
}
function loadExtensionsFromDir(dir) {
    const extensionsDir = path.join(dir, EXTENSIONS_DIRECTORY_NAME);
    if (!fs.existsSync(extensionsDir)) {
        return [];
    }
    const extensions = [];
    for (const subdir of fs.readdirSync(extensionsDir)) {
        const extensionDir = path.join(extensionsDir, subdir);
        const extension = loadExtension(extensionDir);
        if (extension != null) {
            extensions.push(extension);
        }
    }
    return extensions;
}
function loadExtension(extensionDir) {
    if (!fs.statSync(extensionDir).isDirectory()) {
        console.error(`Warning: unexpected file ${extensionDir} in extensions directory.`);
        return null;
    }
    let configFilePath = path.join(extensionDir, EXTENSIONS_CONFIG_FILENAME);
    if (!fs.existsSync(configFilePath)) {
        const oldConfigFilePath = path.join(extensionDir, EXTENSIONS_CONFIG_FILENAME_OLD);
        if (!fs.existsSync(oldConfigFilePath)) {
            console.error(`Warning: extension directory ${extensionDir} does not contain a config file ${configFilePath}.`);
            return null;
        }
        configFilePath = oldConfigFilePath;
    }
    try {
        const configContent = fs.readFileSync(configFilePath, 'utf-8');
        const config = JSON.parse(configContent);
        if (!config.name || !config.version) {
            console.error(`Invalid extension config in ${configFilePath}: missing name or version.`);
            return null;
        }
        const contextFiles = getContextFileNames(config)
            .map((contextFileName) => path.join(extensionDir, contextFileName))
            .filter((contextFilePath) => fs.existsSync(contextFilePath));
        return {
            path: extensionDir,
            config,
            contextFiles,
        };
    }
    catch (e) {
        console.error(`Warning: error parsing extension config in ${configFilePath}: ${e}`);
        return null;
    }
}
function getContextFileNames(config) {
    if (!config.contextFileName) {
        return ['QWEN.md'];
    }
    else if (!Array.isArray(config.contextFileName)) {
        return [config.contextFileName];
    }
    return config.contextFileName;
}
export function annotateActiveExtensions(extensions, enabledExtensionNames) {
    const annotatedExtensions = [];
    if (enabledExtensionNames.length === 0) {
        return extensions.map((extension) => ({
            name: extension.config.name,
            version: extension.config.version,
            isActive: true,
            path: extension.path,
        }));
    }
    const lowerCaseEnabledExtensions = new Set(enabledExtensionNames.map((e) => e.trim().toLowerCase()));
    if (lowerCaseEnabledExtensions.size === 1 &&
        lowerCaseEnabledExtensions.has('none')) {
        return extensions.map((extension) => ({
            name: extension.config.name,
            version: extension.config.version,
            isActive: false,
            path: extension.path,
        }));
    }
    const notFoundNames = new Set(lowerCaseEnabledExtensions);
    for (const extension of extensions) {
        const lowerCaseName = extension.config.name.toLowerCase();
        const isActive = lowerCaseEnabledExtensions.has(lowerCaseName);
        if (isActive) {
            notFoundNames.delete(lowerCaseName);
        }
        annotatedExtensions.push({
            name: extension.config.name,
            version: extension.config.version,
            isActive,
            path: extension.path,
        });
    }
    for (const requestedName of notFoundNames) {
        console.error(`Extension not found: ${requestedName}`);
    }
    return annotatedExtensions;
}
//# sourceMappingURL=extension.js.map