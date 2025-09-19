/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { MCPServerConfig, BugCommandSettings, TelemetrySettings, AuthType, ChatCompressionSettings } from '@qwen-code/qwen-code-core';
import { CustomTheme } from '../ui/themes/theme.js';
export interface SettingDefinition {
    type: 'boolean' | 'string' | 'number' | 'array' | 'object';
    label: string;
    category: string;
    requiresRestart: boolean;
    default: boolean | string | number | string[] | object | undefined;
    description?: string;
    parentKey?: string;
    childKey?: string;
    key?: string;
    properties?: SettingsSchema;
    showInDialog?: boolean;
}
export interface SettingsSchema {
    [key: string]: SettingDefinition;
}
export type MemoryImportFormat = 'tree' | 'flat';
export type DnsResolutionOrder = 'ipv4first' | 'verbatim';
/**
 * The canonical schema for all settings.
 * The structure of this object defines the structure of the `Settings` type.
 * `as const` is crucial for TypeScript to infer the most specific types possible.
 */
export declare const SETTINGS_SCHEMA: {
    readonly theme: {
        readonly type: "string";
        readonly label: "Theme";
        readonly category: "UI";
        readonly requiresRestart: false;
        readonly default: string | undefined;
        readonly description: "The color theme for the UI.";
        readonly showInDialog: false;
    };
    readonly customThemes: {
        readonly type: "object";
        readonly label: "Custom Themes";
        readonly category: "UI";
        readonly requiresRestart: false;
        readonly default: Record<string, CustomTheme>;
        readonly description: "Custom theme definitions.";
        readonly showInDialog: false;
    };
    readonly hideWindowTitle: {
        readonly type: "boolean";
        readonly label: "Hide Window Title";
        readonly category: "UI";
        readonly requiresRestart: true;
        readonly default: false;
        readonly description: "Hide the window title bar";
        readonly showInDialog: true;
    };
    readonly hideTips: {
        readonly type: "boolean";
        readonly label: "Hide Tips";
        readonly category: "UI";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Hide helpful tips in the UI";
        readonly showInDialog: true;
    };
    readonly hideBanner: {
        readonly type: "boolean";
        readonly label: "Hide Banner";
        readonly category: "UI";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Hide the application banner";
        readonly showInDialog: true;
    };
    readonly hideFooter: {
        readonly type: "boolean";
        readonly label: "Hide Footer";
        readonly category: "UI";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Hide the footer from the UI";
        readonly showInDialog: true;
    };
    readonly showMemoryUsage: {
        readonly type: "boolean";
        readonly label: "Show Memory Usage";
        readonly category: "UI";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Display memory usage information in the UI";
        readonly showInDialog: true;
    };
    readonly usageStatisticsEnabled: {
        readonly type: "boolean";
        readonly label: "Enable Usage Statistics";
        readonly category: "General";
        readonly requiresRestart: true;
        readonly default: true;
        readonly description: "Enable collection of usage statistics";
        readonly showInDialog: false;
    };
    readonly autoConfigureMaxOldSpaceSize: {
        readonly type: "boolean";
        readonly label: "Auto Configure Max Old Space Size";
        readonly category: "General";
        readonly requiresRestart: true;
        readonly default: false;
        readonly description: "Automatically configure Node.js memory limits";
        readonly showInDialog: true;
    };
    readonly preferredEditor: {
        readonly type: "string";
        readonly label: "Preferred Editor";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: string | undefined;
        readonly description: "The preferred editor to open files in.";
        readonly showInDialog: false;
    };
    readonly maxSessionTurns: {
        readonly type: "number";
        readonly label: "Max Session Turns";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: -1;
        readonly description: "Maximum number of user/model/tool turns to keep in a session. -1 means unlimited.";
        readonly showInDialog: true;
    };
    readonly memoryImportFormat: {
        readonly type: "string";
        readonly label: "Memory Import Format";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: MemoryImportFormat | undefined;
        readonly description: "The format to use when importing memory.";
        readonly showInDialog: false;
    };
    readonly memoryDiscoveryMaxDirs: {
        readonly type: "number";
        readonly label: "Memory Discovery Max Dirs";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: 200;
        readonly description: "Maximum number of directories to search for memory.";
        readonly showInDialog: true;
    };
    readonly contextFileName: {
        readonly type: "object";
        readonly label: "Context File Name";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: string | string[] | undefined;
        readonly description: "The name of the context file.";
        readonly showInDialog: false;
    };
    readonly vimMode: {
        readonly type: "boolean";
        readonly label: "Vim Mode";
        readonly category: "Mode";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Enable Vim keybindings";
        readonly showInDialog: true;
    };
    readonly ideMode: {
        readonly type: "boolean";
        readonly label: "IDE Mode";
        readonly category: "Mode";
        readonly requiresRestart: true;
        readonly default: false;
        readonly description: "Enable IDE integration mode";
        readonly showInDialog: true;
    };
    readonly accessibility: {
        readonly type: "object";
        readonly label: "Accessibility";
        readonly category: "Accessibility";
        readonly requiresRestart: true;
        readonly default: {};
        readonly description: "Accessibility settings.";
        readonly showInDialog: false;
        readonly properties: {
            readonly disableLoadingPhrases: {
                readonly type: "boolean";
                readonly label: "Disable Loading Phrases";
                readonly category: "Accessibility";
                readonly requiresRestart: true;
                readonly default: false;
                readonly description: "Disable loading phrases for accessibility";
                readonly showInDialog: true;
            };
        };
    };
    readonly checkpointing: {
        readonly type: "object";
        readonly label: "Checkpointing";
        readonly category: "Checkpointing";
        readonly requiresRestart: true;
        readonly default: {};
        readonly description: "Session checkpointing settings.";
        readonly showInDialog: false;
        readonly properties: {
            readonly enabled: {
                readonly type: "boolean";
                readonly label: "Enable Checkpointing";
                readonly category: "Checkpointing";
                readonly requiresRestart: true;
                readonly default: false;
                readonly description: "Enable session checkpointing for recovery";
                readonly showInDialog: false;
            };
        };
    };
    readonly fileFiltering: {
        readonly type: "object";
        readonly label: "File Filtering";
        readonly category: "File Filtering";
        readonly requiresRestart: true;
        readonly default: {};
        readonly description: "Settings for git-aware file filtering.";
        readonly showInDialog: false;
        readonly properties: {
            readonly respectGitIgnore: {
                readonly type: "boolean";
                readonly label: "Respect .gitignore";
                readonly category: "File Filtering";
                readonly requiresRestart: true;
                readonly default: true;
                readonly description: "Respect .gitignore files when searching";
                readonly showInDialog: true;
            };
            readonly respectGeminiIgnore: {
                readonly type: "boolean";
                readonly label: "Respect .geminiignore";
                readonly category: "File Filtering";
                readonly requiresRestart: true;
                readonly default: true;
                readonly description: "Respect .geminiignore files when searching";
                readonly showInDialog: true;
            };
            readonly enableRecursiveFileSearch: {
                readonly type: "boolean";
                readonly label: "Enable Recursive File Search";
                readonly category: "File Filtering";
                readonly requiresRestart: true;
                readonly default: true;
                readonly description: "Enable recursive file search functionality";
                readonly showInDialog: true;
            };
        };
    };
    readonly disableAutoUpdate: {
        readonly type: "boolean";
        readonly label: "Disable Auto Update";
        readonly category: "Updates";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Disable automatic updates";
        readonly showInDialog: true;
    };
    readonly shouldUseNodePtyShell: {
        readonly type: "boolean";
        readonly label: "Use node-pty for Shell Execution";
        readonly category: "Shell";
        readonly requiresRestart: true;
        readonly default: false;
        readonly description: "Use node-pty for shell command execution. Fallback to child_process still applies.";
        readonly showInDialog: true;
    };
    readonly selectedAuthType: {
        readonly type: "string";
        readonly label: "Selected Auth Type";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: AuthType | undefined;
        readonly description: "The currently selected authentication type.";
        readonly showInDialog: false;
    };
    readonly useExternalAuth: {
        readonly type: "boolean";
        readonly label: "Use External Auth";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: boolean | undefined;
        readonly description: "Whether to use an external authentication flow.";
        readonly showInDialog: false;
    };
    readonly sandbox: {
        readonly type: "object";
        readonly label: "Sandbox";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: boolean | string | undefined;
        readonly description: "Sandbox execution environment (can be a boolean or a path string).";
        readonly showInDialog: false;
    };
    readonly coreTools: {
        readonly type: "array";
        readonly label: "Core Tools";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: string[] | undefined;
        readonly description: "Paths to core tool definitions.";
        readonly showInDialog: false;
    };
    readonly excludeTools: {
        readonly type: "array";
        readonly label: "Exclude Tools";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: string[] | undefined;
        readonly description: "Tool names to exclude from discovery.";
        readonly showInDialog: false;
    };
    readonly toolDiscoveryCommand: {
        readonly type: "string";
        readonly label: "Tool Discovery Command";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: string | undefined;
        readonly description: "Command to run for tool discovery.";
        readonly showInDialog: false;
    };
    readonly toolCallCommand: {
        readonly type: "string";
        readonly label: "Tool Call Command";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: string | undefined;
        readonly description: "Command to run for tool calls.";
        readonly showInDialog: false;
    };
    readonly mcpServerCommand: {
        readonly type: "string";
        readonly label: "MCP Server Command";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: string | undefined;
        readonly description: "Command to start an MCP server.";
        readonly showInDialog: false;
    };
    readonly mcpServers: {
        readonly type: "object";
        readonly label: "MCP Servers";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: Record<string, MCPServerConfig>;
        readonly description: "Configuration for MCP servers.";
        readonly showInDialog: false;
    };
    readonly allowMCPServers: {
        readonly type: "array";
        readonly label: "Allow MCP Servers";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: string[] | undefined;
        readonly description: "A whitelist of MCP servers to allow.";
        readonly showInDialog: false;
    };
    readonly excludeMCPServers: {
        readonly type: "array";
        readonly label: "Exclude MCP Servers";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: string[] | undefined;
        readonly description: "A blacklist of MCP servers to exclude.";
        readonly showInDialog: false;
    };
    readonly telemetry: {
        readonly type: "object";
        readonly label: "Telemetry";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: TelemetrySettings | undefined;
        readonly description: "Telemetry configuration.";
        readonly showInDialog: false;
    };
    readonly bugCommand: {
        readonly type: "object";
        readonly label: "Bug Command";
        readonly category: "Advanced";
        readonly requiresRestart: false;
        readonly default: BugCommandSettings | undefined;
        readonly description: "Configuration for the bug report command.";
        readonly showInDialog: false;
    };
    readonly summarizeToolOutput: {
        readonly type: "object";
        readonly label: "Summarize Tool Output";
        readonly category: "Advanced";
        readonly requiresRestart: false;
        readonly default: Record<string, {
            tokenBudget?: number;
        }> | undefined;
        readonly description: "Settings for summarizing tool output.";
        readonly showInDialog: false;
    };
    readonly dnsResolutionOrder: {
        readonly type: "string";
        readonly label: "DNS Resolution Order";
        readonly category: "Advanced";
        readonly requiresRestart: true;
        readonly default: DnsResolutionOrder | undefined;
        readonly description: "The DNS resolution order.";
        readonly showInDialog: false;
    };
    readonly excludedProjectEnvVars: {
        readonly type: "array";
        readonly label: "Excluded Project Environment Variables";
        readonly category: "Advanced";
        readonly requiresRestart: false;
        readonly default: string[];
        readonly description: "Environment variables to exclude from project context.";
        readonly showInDialog: false;
    };
    readonly disableUpdateNag: {
        readonly type: "boolean";
        readonly label: "Disable Update Nag";
        readonly category: "Updates";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Disable update notification prompts.";
        readonly showInDialog: false;
    };
    readonly includeDirectories: {
        readonly type: "array";
        readonly label: "Include Directories";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: string[];
        readonly description: "Additional directories to include in the workspace context.";
        readonly showInDialog: false;
    };
    readonly loadMemoryFromIncludeDirectories: {
        readonly type: "boolean";
        readonly label: "Load Memory From Include Directories";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Whether to load memory files from include directories.";
        readonly showInDialog: true;
    };
    readonly model: {
        readonly type: "string";
        readonly label: "Model";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: string | undefined;
        readonly description: "The Gemini model to use for conversations.";
        readonly showInDialog: false;
    };
    readonly hasSeenIdeIntegrationNudge: {
        readonly type: "boolean";
        readonly label: "Has Seen IDE Integration Nudge";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Whether the user has seen the IDE integration nudge.";
        readonly showInDialog: false;
    };
    readonly folderTrustFeature: {
        readonly type: "boolean";
        readonly label: "Folder Trust Feature";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Enable folder trust feature for enhanced security.";
        readonly showInDialog: true;
    };
    readonly folderTrust: {
        readonly type: "boolean";
        readonly label: "Folder Trust";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Setting to track whether Folder trust is enabled.";
        readonly showInDialog: true;
    };
    readonly chatCompression: {
        readonly type: "object";
        readonly label: "Chat Compression";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: ChatCompressionSettings | undefined;
        readonly description: "Chat compression settings.";
        readonly showInDialog: false;
    };
    readonly showLineNumbers: {
        readonly type: "boolean";
        readonly label: "Show Line Numbers";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Show line numbers in the chat.";
        readonly showInDialog: true;
    };
    readonly contentGenerator: {
        readonly type: "object";
        readonly label: "Content Generator";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: Record<string, unknown> | undefined;
        readonly description: "Content generator settings.";
        readonly showInDialog: false;
        readonly properties: {
            readonly timeout: {
                readonly type: "number";
                readonly label: "Timeout";
                readonly category: "Content Generator";
                readonly requiresRestart: false;
                readonly default: number | undefined;
                readonly description: "Request timeout in milliseconds.";
                readonly parentKey: "contentGenerator";
                readonly childKey: "timeout";
                readonly showInDialog: true;
            };
            readonly maxRetries: {
                readonly type: "number";
                readonly label: "Max Retries";
                readonly category: "Content Generator";
                readonly requiresRestart: false;
                readonly default: number | undefined;
                readonly description: "Maximum number of retries for failed requests.";
                readonly parentKey: "contentGenerator";
                readonly childKey: "maxRetries";
                readonly showInDialog: true;
            };
            readonly disableCacheControl: {
                readonly type: "boolean";
                readonly label: "Disable Cache Control";
                readonly category: "Content Generator";
                readonly requiresRestart: false;
                readonly default: false;
                readonly description: "Disable cache control for DashScope providers.";
                readonly parentKey: "contentGenerator";
                readonly childKey: "disableCacheControl";
                readonly showInDialog: true;
            };
        };
    };
    readonly enableOpenAILogging: {
        readonly type: "boolean";
        readonly label: "Enable OpenAI Logging";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Enable OpenAI logging.";
        readonly showInDialog: true;
    };
    readonly sessionTokenLimit: {
        readonly type: "number";
        readonly label: "Session Token Limit";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: number | undefined;
        readonly description: "The maximum number of tokens allowed in a session.";
        readonly showInDialog: false;
    };
    readonly systemPromptMappings: {
        readonly type: "object";
        readonly label: "System Prompt Mappings";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: Record<string, string> | undefined;
        readonly description: "Mappings of system prompts to model names.";
        readonly showInDialog: false;
    };
    readonly tavilyApiKey: {
        readonly type: "string";
        readonly label: "Tavily API Key";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: string | undefined;
        readonly description: "The API key for the Tavily API.";
        readonly showInDialog: false;
    };
    readonly skipNextSpeakerCheck: {
        readonly type: "boolean";
        readonly label: "Skip Next Speaker Check";
        readonly category: "General";
        readonly requiresRestart: false;
        readonly default: false;
        readonly description: "Skip the next speaker check.";
        readonly showInDialog: true;
    };
    readonly enableWelcomeBack: {
        readonly type: "boolean";
        readonly label: "Enable Welcome Back";
        readonly category: "UI";
        readonly requiresRestart: false;
        readonly default: true;
        readonly description: "Show welcome back dialog when returning to a project with conversation history.";
        readonly showInDialog: true;
    };
};
type InferSettings<T extends SettingsSchema> = {
    -readonly [K in keyof T]?: T[K] extends {
        properties: SettingsSchema;
    } ? InferSettings<T[K]['properties']> : T[K]['default'] extends boolean ? boolean : T[K]['default'];
};
export type Settings = InferSettings<typeof SETTINGS_SCHEMA>;
export {};
