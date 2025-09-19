/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { TextBuffer } from './shared/text-buffer.js';
import { Key } from '../hooks/useKeypress.js';
import { CommandContext, SlashCommand } from '../commands/types.js';
import { Config } from '@qwen-code/qwen-code-core';
export interface InputPromptProps {
    buffer: TextBuffer;
    onSubmit: (value: string) => void;
    userMessages: readonly string[];
    onClearScreen: () => void;
    config: Config;
    slashCommands: readonly SlashCommand[];
    commandContext: CommandContext;
    placeholder?: string;
    focus?: boolean;
    inputWidth: number;
    suggestionsWidth: number;
    shellModeActive: boolean;
    setShellModeActive: (value: boolean) => void;
    onEscapePromptChange?: (showPrompt: boolean) => void;
    vimHandleInput?: (key: Key) => boolean;
}
export declare const InputPrompt: React.FC<InputPromptProps>;
