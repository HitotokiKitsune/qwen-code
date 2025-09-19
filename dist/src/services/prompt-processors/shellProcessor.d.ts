/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommandContext } from '../../ui/commands/types.js';
import { IPromptProcessor } from './types.js';
export declare class ConfirmationRequiredError extends Error {
    commandsToConfirm: string[];
    constructor(message: string, commandsToConfirm: string[]);
}
/**
 * Handles prompt interpolation, including shell command execution (`!{...}`)
 * and context-aware argument injection (`{{args}}`).
 *
 * This processor ensures that:
 * 1. `{{args}}` outside `!{...}` are replaced with raw input.
 * 2. `{{args}}` inside `!{...}` are replaced with shell-escaped input.
 * 3. Shell commands are executed securely after argument substitution.
 * 4. Parsing correctly handles nested braces.
 */
export declare class ShellProcessor implements IPromptProcessor {
    private readonly commandName;
    constructor(commandName: string);
    process(prompt: string, context: CommandContext): Promise<string>;
    /**
     * Iteratively parses the prompt string to extract shell injections (!{...}),
     * correctly handling nested braces within the command.
     *
     * @param prompt The prompt string to parse.
     * @returns An array of extracted ShellInjection objects.
     * @throws Error if an unclosed injection (`!{`) is found.
     */
    private extractInjections;
}
