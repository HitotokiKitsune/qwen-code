/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { UpdateObject } from '../ui/utils/updateCheck.js';
import { LoadedSettings } from '../config/settings.js';
import { HistoryItem } from '../ui/types.js';
import { spawn } from 'child_process';
export declare function handleAutoUpdate(info: UpdateObject | null, settings: LoadedSettings, projectRoot: string, spawnFn?: typeof spawn): import("child_process").ChildProcessWithoutNullStreams | undefined;
export declare function setUpdateHandler(addItem: (item: Omit<HistoryItem, 'id'>, timestamp: number) => void, setUpdateInfo: (info: UpdateObject | null) => void): () => void;
