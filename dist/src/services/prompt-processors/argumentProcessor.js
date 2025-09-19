/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Appends the user's full command invocation to the prompt if arguments are
 * provided, allowing the model to perform its own argument parsing.
 *
 * This processor is only used if the prompt does NOT contain {{args}}.
 */
export class DefaultArgumentProcessor {
    async process(prompt, context) {
        if (context.invocation.args) {
            return `${prompt}\n\n${context.invocation.raw}`;
        }
        return prompt;
    }
}
//# sourceMappingURL=argumentProcessor.js.map