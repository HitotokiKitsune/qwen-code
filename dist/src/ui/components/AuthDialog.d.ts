/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { AuthType } from '@qwen-code/qwen-code-core';
import React from 'react';
import { LoadedSettings, SettingScope } from '../../config/settings.js';
interface AuthDialogProps {
    onSelect: (authMethod: AuthType | undefined, scope: SettingScope) => void;
    settings: LoadedSettings;
    initialErrorMessage?: string | null;
}
export declare function AuthDialog({ onSelect, settings, initialErrorMessage, }: AuthDialogProps): React.JSX.Element;
export {};
