/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { SlashCommand } from '../commands/types.js';
interface Help {
    commands: readonly SlashCommand[];
}
export declare const Help: React.FC<Help>;
export {};
