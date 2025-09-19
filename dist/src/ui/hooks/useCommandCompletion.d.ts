/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Suggestion } from '../components/SuggestionsDisplay.js';
import { CommandContext, SlashCommand } from '../commands/types.js';
import { TextBuffer } from '../components/shared/text-buffer.js';
import { Config } from '@qwen-code/qwen-code-core';
export declare enum CompletionMode {
    IDLE = "IDLE",
    AT = "AT",
    SLASH = "SLASH"
}
export interface UseCommandCompletionReturn {
    suggestions: Suggestion[];
    activeSuggestionIndex: number;
    visibleStartIndex: number;
    showSuggestions: boolean;
    isLoadingSuggestions: boolean;
    isPerfectMatch: boolean;
    setActiveSuggestionIndex: React.Dispatch<React.SetStateAction<number>>;
    setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
    resetCompletionState: () => void;
    navigateUp: () => void;
    navigateDown: () => void;
    handleAutocomplete: (indexToUse: number) => void;
}
export declare function useCommandCompletion(buffer: TextBuffer, dirs: readonly string[], cwd: string, slashCommands: readonly SlashCommand[], commandContext: CommandContext, reverseSearchActive?: boolean, config?: Config): UseCommandCompletionReturn;
