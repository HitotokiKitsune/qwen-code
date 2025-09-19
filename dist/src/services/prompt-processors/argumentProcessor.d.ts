/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { IPromptProcessor } from './types.js';
import { CommandContext } from '../../ui/commands/types.js';
/**
 * Appends the user's full command invocation to the prompt if arguments are
 * provided, allowing the model to perform its own argument parsing.
 *
 * This processor is only used if the prompt does NOT contain {{args}}.
 */
export declare class DefaultArgumentProcessor implements IPromptProcessor {
    process(prompt: string, context: CommandContext): Promise<string>;
}
