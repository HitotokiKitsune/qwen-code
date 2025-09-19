/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Config } from '@qwen-code/qwen-code-core';
import { SlashCommand } from '../ui/commands/types.js';
import { ICommandLoader } from './types.js';
/**
 * Discovers and loads executable slash commands from prompts exposed by
 * Model-Context-Protocol (MCP) servers.
 */
export declare class McpPromptLoader implements ICommandLoader {
    private readonly config;
    constructor(config: Config | null);
    /**
     * Loads all available prompts from all configured MCP servers and adapts
     * them into executable SlashCommand objects.
     *
     * @param _signal An AbortSignal (unused for this synchronous loader).
     * @returns A promise that resolves to an array of loaded SlashCommands.
     */
    loadCommands(_signal: AbortSignal): Promise<SlashCommand[]>;
    private parseArgs;
}
