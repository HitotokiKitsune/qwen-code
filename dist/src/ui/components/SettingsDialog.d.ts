/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { LoadedSettings, SettingScope } from '../../config/settings.js';
interface SettingsDialogProps {
    settings: LoadedSettings;
    onSelect: (settingName: string | undefined, scope: SettingScope) => void;
    onRestartRequest?: () => void;
}
export declare function SettingsDialog({ settings, onSelect, onRestartRequest, }: SettingsDialogProps): React.JSX.Element;
export {};
