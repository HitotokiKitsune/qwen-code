/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { MCPServerConfig, GeminiCLIExtension } from '@qwen-code/qwen-code-core';
export declare const EXTENSIONS_DIRECTORY_NAME: string;
export declare const EXTENSIONS_CONFIG_FILENAME = "qwen-extension.json";
export declare const EXTENSIONS_CONFIG_FILENAME_OLD = "gemini-extension.json";
export interface Extension {
    path: string;
    config: ExtensionConfig;
    contextFiles: string[];
}
export interface ExtensionConfig {
    name: string;
    version: string;
    mcpServers?: Record<string, MCPServerConfig>;
    contextFileName?: string | string[];
    excludeTools?: string[];
}
export declare function loadExtensions(workspaceDir: string): Extension[];
export declare function annotateActiveExtensions(extensions: Extension[], enabledExtensionNames: string[]): GeminiCLIExtension[];
