/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useCallback, useEffect } from 'react';
import { FolderTrustChoice } from '../components/FolderTrustDialog.js';
import { loadTrustedFolders, TrustLevel, isWorkspaceTrusted, } from '../../config/trustedFolders.js';
import * as process from 'process';
export const useFolderTrust = (settings, onTrustChange) => {
    const [isTrusted, setIsTrusted] = useState(undefined);
    const [isFolderTrustDialogOpen, setIsFolderTrustDialogOpen] = useState(false);
    const { folderTrust, folderTrustFeature } = settings.merged;
    useEffect(() => {
        const trusted = isWorkspaceTrusted({
            folderTrust,
            folderTrustFeature,
        });
        setIsTrusted(trusted);
        setIsFolderTrustDialogOpen(trusted === undefined);
        onTrustChange(trusted);
    }, [onTrustChange, folderTrust, folderTrustFeature]);
    const handleFolderTrustSelect = useCallback((choice) => {
        const trustedFolders = loadTrustedFolders();
        const cwd = process.cwd();
        let trustLevel;
        switch (choice) {
            case FolderTrustChoice.TRUST_FOLDER:
                trustLevel = TrustLevel.TRUST_FOLDER;
                break;
            case FolderTrustChoice.TRUST_PARENT:
                trustLevel = TrustLevel.TRUST_PARENT;
                break;
            case FolderTrustChoice.DO_NOT_TRUST:
                trustLevel = TrustLevel.DO_NOT_TRUST;
                break;
            default:
                return;
        }
        trustedFolders.setValue(cwd, trustLevel);
        const trusted = isWorkspaceTrusted({
            folderTrust,
            folderTrustFeature,
        });
        setIsTrusted(trusted);
        setIsFolderTrustDialogOpen(false);
        onTrustChange(trusted);
    }, [onTrustChange, folderTrust, folderTrustFeature]);
    return {
        isTrusted,
        isFolderTrustDialogOpen,
        handleFolderTrustSelect,
    };
};
//# sourceMappingURL=useFolderTrust.js.map