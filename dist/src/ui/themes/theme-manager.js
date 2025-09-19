/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { AyuDark } from './ayu.js';
import { AyuLight } from './ayu-light.js';
import { AtomOneDark } from './atom-one-dark.js';
import { Dracula } from './dracula.js';
import { GitHubDark } from './github-dark.js';
import { GitHubLight } from './github-light.js';
import { GoogleCode } from './googlecode.js';
import { DefaultLight } from './default-light.js';
import { DefaultDark } from './default.js';
import { ShadesOfPurple } from './shades-of-purple.js';
import { XCode } from './xcode.js';
import { QwenLight } from './qwen-light.js';
import { QwenDark } from './qwen-dark.js';
import { createCustomTheme, validateCustomTheme, } from './theme.js';
import { ANSI } from './ansi.js';
import { ANSILight } from './ansi-light.js';
import { NoColorTheme } from './no-color.js';
import process from 'node:process';
export const DEFAULT_THEME = QwenDark;
class ThemeManager {
    availableThemes;
    activeTheme;
    customThemes = new Map();
    constructor() {
        this.availableThemes = [
            AyuDark,
            AyuLight,
            AtomOneDark,
            Dracula,
            DefaultLight,
            DefaultDark,
            GitHubDark,
            GitHubLight,
            GoogleCode,
            QwenLight,
            QwenDark,
            ShadesOfPurple,
            XCode,
            ANSI,
            ANSILight,
        ];
        this.activeTheme = DEFAULT_THEME;
    }
    /**
     * Loads custom themes from settings.
     * @param customThemesSettings Custom themes from settings.
     */
    loadCustomThemes(customThemesSettings) {
        this.customThemes.clear();
        if (!customThemesSettings) {
            return;
        }
        for (const [name, customThemeConfig] of Object.entries(customThemesSettings)) {
            const validation = validateCustomTheme(customThemeConfig);
            if (validation.isValid) {
                if (validation.warning) {
                    console.warn(`Theme "${name}": ${validation.warning}`);
                }
                const themeWithDefaults = {
                    ...DEFAULT_THEME.colors,
                    ...customThemeConfig,
                    name: customThemeConfig.name || name,
                    type: 'custom',
                };
                try {
                    const theme = createCustomTheme(themeWithDefaults);
                    this.customThemes.set(name, theme);
                }
                catch (error) {
                    console.warn(`Failed to load custom theme "${name}":`, error);
                }
            }
            else {
                console.warn(`Invalid custom theme "${name}": ${validation.error}`);
            }
        }
        // If the current active theme is a custom theme, keep it if still valid
        if (this.activeTheme &&
            this.activeTheme.type === 'custom' &&
            this.customThemes.has(this.activeTheme.name)) {
            this.activeTheme = this.customThemes.get(this.activeTheme.name);
        }
    }
    /**
     * Sets the active theme.
     * @param themeName The name of the theme to set as active.
     * @returns True if the theme was successfully set, false otherwise.
     */
    setActiveTheme(themeName) {
        const theme = this.findThemeByName(themeName);
        if (!theme) {
            return false;
        }
        this.activeTheme = theme;
        return true;
    }
    /**
     * Gets the currently active theme.
     * @returns The active theme.
     */
    getActiveTheme() {
        if (process.env['NO_COLOR']) {
            return NoColorTheme;
        }
        // Ensure the active theme is always valid (fall back to default if not)
        if (!this.activeTheme || !this.findThemeByName(this.activeTheme.name)) {
            this.activeTheme = DEFAULT_THEME;
        }
        return this.activeTheme;
    }
    /**
     * Gets the semantic colors for the active theme.
     * @returns The semantic colors.
     */
    getSemanticColors() {
        return this.getActiveTheme().semanticColors;
    }
    /**
     * Gets a list of custom theme names.
     * @returns Array of custom theme names.
     */
    getCustomThemeNames() {
        return Array.from(this.customThemes.keys());
    }
    /**
     * Checks if a theme name is a custom theme.
     * @param themeName The theme name to check.
     * @returns True if the theme is custom.
     */
    isCustomTheme(themeName) {
        return this.customThemes.has(themeName);
    }
    /**
     * Returns a list of available theme names.
     */
    getAvailableThemes() {
        const builtInThemes = this.availableThemes.map((theme) => ({
            name: theme.name,
            type: theme.type,
            isCustom: false,
        }));
        const customThemes = Array.from(this.customThemes.values()).map((theme) => ({
            name: theme.name,
            type: theme.type,
            isCustom: true,
        }));
        // Separate Qwen themes
        const qwenThemes = builtInThemes.filter((theme) => theme.name === QwenLight.name || theme.name === QwenDark.name);
        const otherBuiltInThemes = builtInThemes.filter((theme) => theme.name !== QwenLight.name && theme.name !== QwenDark.name);
        // Sort other themes by type and then name
        const sortedOtherThemes = [...otherBuiltInThemes, ...customThemes].sort((a, b) => {
            const typeOrder = (type) => {
                switch (type) {
                    case 'dark':
                        return 1;
                    case 'light':
                        return 2;
                    case 'ansi':
                        return 3;
                    case 'custom':
                        return 4; // Custom themes at the end
                    default:
                        return 5;
                }
            };
            const typeComparison = typeOrder(a.type) - typeOrder(b.type);
            if (typeComparison !== 0) {
                return typeComparison;
            }
            return a.name.localeCompare(b.name);
        });
        // Combine Qwen themes first, then sorted others
        return [...qwenThemes, ...sortedOtherThemes];
    }
    /**
     * Gets a theme by name.
     * @param themeName The name of the theme to get.
     * @returns The theme if found, undefined otherwise.
     */
    getTheme(themeName) {
        return this.findThemeByName(themeName);
    }
    findThemeByName(themeName) {
        if (!themeName) {
            return DEFAULT_THEME;
        }
        // First check built-in themes
        const builtInTheme = this.availableThemes.find((theme) => theme.name === themeName);
        if (builtInTheme) {
            return builtInTheme;
        }
        // Then check custom themes
        return this.customThemes.get(themeName);
    }
}
// Export an instance of the ThemeManager
export const themeManager = new ThemeManager();
//# sourceMappingURL=theme-manager.js.map