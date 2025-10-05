/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import type OpenAI from 'openai';
import {
  type GenerateContentParameters,
  GenerateContentResponse,
  type Content,
} from '@google/genai';
import type { Config } from '../../config/config.js';
import type { ContentGeneratorConfig } from '../contentGenerator.js';
import type { OpenAICompatibleProvider } from './provider/index.js';
import { OpenAIContentConverter } from './converter.js';
import type { TelemetryService, RequestContext } from './telemetryService.js';
import type { ErrorHandler } from './errorHandler.js';
import { tokenLimit } from '../tokenLimits.js';
import { ToolNames } from '../../tools/tool-names.js';
import { ToolErrorType } from '../../tools/tool-error.js';
import type { ReadFileToolParams } from '../../tools/read-file.js';
import { DEFAULT_MAX_LINES_TEXT_FILE } from '../../utils/fileUtils.js';

export interface PipelineConfig {
  cliConfig: Config;
  provider: OpenAICompatibleProvider;
  contentGeneratorConfig: ContentGeneratorConfig;
  telemetryService: TelemetryService;
  errorHandler: ErrorHandler;
}

export class ContentGenerationPipeline {
  client: OpenAI;
  private converter: OpenAIContentConverter;
  private contentGeneratorConfig: ContentGeneratorConfig;

  constructor(private config: PipelineConfig) {
    this.contentGeneratorConfig = config.contentGeneratorConfig;
    this.client = this.config.provider.buildClient();
    this.converter = new OpenAIContentConverter(
      this.contentGeneratorConfig.model,
    );
  }

  async execute(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse> {
    return this.executeWithErrorHandling(
      request,
      userPromptId,
      false,
      async (openaiRequest, context) => {
        const openaiResponse = (await this.client.chat.completions.create(
          openaiRequest,
        )) as OpenAI.Chat.ChatCompletion;

        const geminiResponse =
          this.converter.convertOpenAIResponseToGemini(openaiResponse);

        // Log success
        await this.config.telemetryService.logSuccess(
          context,
          geminiResponse,
          openaiRequest,
          openaiResponse,
        );

        return geminiResponse;
      },
    );
  }

  async executeStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    return this.executeWithErrorHandling(
      request,
      userPromptId,
      true,
      async (openaiRequest, context) => {
        // Stage 1: Create OpenAI stream
        const stream = (await this.client.chat.completions.create(
          openaiRequest,
        )) as AsyncIterable<OpenAI.Chat.ChatCompletionChunk>;

        // Stage 2: Process stream with conversion and logging
        return this.processStreamWithLogging(
          stream,
          context,
          openaiRequest,
          request,
        );
      },
    );
  }

  /**
   * Stage 2: Process OpenAI stream with conversion and logging
   * This method handles the complete stream processing pipeline:
   * 1. Convert OpenAI chunks to Gemini format while preserving original chunks
   * 2. Filter empty responses
   * 3. Handle chunk merging for providers that send finishReason and usageMetadata separately
   * 4. Collect both formats for logging
   * 5. Handle success/error logging
   */
  private async *processStreamWithLogging(
    stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>,
    context: RequestContext,
    openaiRequest: OpenAI.Chat.ChatCompletionCreateParams,
    request: GenerateContentParameters,
  ): AsyncGenerator<GenerateContentResponse> {
    const collectedGeminiResponses: GenerateContentResponse[] = [];
    const collectedOpenAIChunks: OpenAI.Chat.ChatCompletionChunk[] = [];

    // Reset streaming tool calls to prevent data pollution from previous streams
    this.converter.resetStreamingToolCalls();

    // State for handling chunk merging
    let pendingFinishResponse: GenerateContentResponse | null = null;

    try {
      // Stage 2a: Convert and yield each chunk while preserving original
      for await (const chunk of stream) {
        // Always collect OpenAI chunks for logging, regardless of Gemini conversion result
        collectedOpenAIChunks.push(chunk);

        const response = this.converter.convertOpenAIChunkToGemini(chunk);

        // Stage 2b: Filter empty responses to avoid downstream issues
        if (
          response.candidates?.[0]?.content?.parts?.length === 0 &&
          !response.candidates?.[0]?.finishReason &&
          !response.usageMetadata
        ) {
          continue;
        }

        // Stage 2c: Handle chunk merging for providers that send finishReason and usageMetadata separately
        const shouldYield = this.handleChunkMerging(
          response,
          collectedGeminiResponses,
          (mergedResponse) => {
            pendingFinishResponse = mergedResponse;
          },
        );

        if (shouldYield) {
          // If we have a pending finish response, yield it instead
          if (pendingFinishResponse) {
            yield pendingFinishResponse;
            pendingFinishResponse = null;
          } else {
            yield response;
          }
        }
      }

      // Stage 2d: If there's still a pending finish response at the end, yield it
      if (pendingFinishResponse) {
        yield pendingFinishResponse;
      }

      // Stage 2e: Stream completed successfully - perform logging with original OpenAI chunks
      context.duration = Date.now() - context.startTime;

      await this.config.telemetryService.logStreamingSuccess(
        context,
        collectedGeminiResponses,
        openaiRequest,
        collectedOpenAIChunks,
      );
    } catch (error) {
      // Clear streaming tool calls on error to prevent data pollution
      this.converter.resetStreamingToolCalls();

      // Use shared error handling logic
      await this.handleError(error, context, request);
    }
  }

  /**
   * Handle chunk merging for providers that send finishReason and usageMetadata separately.
   *
   * Strategy: When we encounter a finishReason chunk, we hold it and merge all subsequent
   * chunks into it until the stream ends. This ensures the final chunk contains both
   * finishReason and the most up-to-date usage information from any provider pattern.
   *
   * @param response Current Gemini response
   * @param collectedGeminiResponses Array to collect responses for logging
   * @param setPendingFinish Callback to set pending finish response
   * @returns true if the response should be yielded, false if it should be held for merging
   */
  private handleChunkMerging(
    response: GenerateContentResponse,
    collectedGeminiResponses: GenerateContentResponse[],
    setPendingFinish: (response: GenerateContentResponse) => void,
  ): boolean {
    const isFinishChunk = response.candidates?.[0]?.finishReason;

    // Check if we have a pending finish response from previous chunks
    const hasPendingFinish =
      collectedGeminiResponses.length > 0 &&
      collectedGeminiResponses[collectedGeminiResponses.length - 1]
        .candidates?.[0]?.finishReason;

    if (isFinishChunk) {
      // This is a finish reason chunk
      collectedGeminiResponses.push(response);
      setPendingFinish(response);
      return false; // Don't yield yet, wait for potential subsequent chunks to merge
    } else if (hasPendingFinish) {
      // We have a pending finish chunk, merge this chunk's data into it
      const lastResponse =
        collectedGeminiResponses[collectedGeminiResponses.length - 1];
      const mergedResponse = new GenerateContentResponse();

      // Keep the finish reason from the previous chunk
      mergedResponse.candidates = lastResponse.candidates;

      // Merge usage metadata if this chunk has it
      if (response.usageMetadata) {
        mergedResponse.usageMetadata = response.usageMetadata;
      } else {
        mergedResponse.usageMetadata = lastResponse.usageMetadata;
      }

      // Update the collected responses with the merged response
      collectedGeminiResponses[collectedGeminiResponses.length - 1] =
        mergedResponse;

      setPendingFinish(mergedResponse);
      return true; // Yield the merged response
    }

    // Normal chunk - collect and yield
    collectedGeminiResponses.push(response);
    return true;
  }

  private async buildRequest(
    request: GenerateContentParameters,
    userPromptId: string,
    streaming: boolean = false,
  ): Promise<OpenAI.Chat.ChatCompletionCreateParams> {
    const messages = this.converter.convertGeminiRequestToOpenAI(request);

    // Apply provider-specific enhancements
    const baseRequest: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.contentGeneratorConfig.model,
      messages,
      ...this.buildSamplingParameters(request),
    };

    // Add streaming options if present
    if (streaming) {
      (
        baseRequest as unknown as OpenAI.Chat.ChatCompletionCreateParamsStreaming
      ).stream = true;
      baseRequest.stream_options = { include_usage: true };
    }

    // Add tools if present
    if (request.config?.tools) {
      baseRequest.tools = await this.converter.convertGeminiToolsToOpenAI(
        request.config.tools,
      );
    }

    // Let provider enhance the request (e.g., add metadata, cache control)
    return this.config.provider.buildRequest(baseRequest, userPromptId);
  }

  private buildSamplingParameters(
    request: GenerateContentParameters,
  ): Record<string, unknown> {
    const configSamplingParams = this.contentGeneratorConfig.samplingParams;

    // Helper function to get parameter value with priority: config > request > default
    const getParameterValue = <T>(
      configKey: keyof NonNullable<typeof configSamplingParams>,
      requestKey: keyof NonNullable<typeof request.config>,
      defaultValue?: T,
    ): T | undefined => {
      const configValue = configSamplingParams?.[configKey] as T | undefined;
      const requestValue = request.config?.[requestKey] as T | undefined;

      if (configValue !== undefined) return configValue;
      if (requestValue !== undefined) return requestValue;
      return defaultValue;
    };

    // Helper function to conditionally add parameter if it has a value
    const addParameterIfDefined = <T>(
      key: string,
      configKey: keyof NonNullable<typeof configSamplingParams>,
      requestKey?: keyof NonNullable<typeof request.config>,
      defaultValue?: T,
    ): Record<string, T> | Record<string, never> => {
      const value = requestKey
        ? getParameterValue(configKey, requestKey, defaultValue)
        : ((configSamplingParams?.[configKey] as T | undefined) ??
          defaultValue);

      return value !== undefined ? { [key]: value } : {};
    };

    const params = {
      // Parameters with request fallback and defaults
      temperature: getParameterValue('temperature', 'temperature', 0.0),
      top_p: getParameterValue('top_p', 'topP', 1.0),

      // Max tokens (special case: different property names)
      ...addParameterIfDefined('max_tokens', 'max_tokens', 'maxOutputTokens'),

      // Config-only parameters (no request fallback)
      ...addParameterIfDefined('top_k', 'top_k'),
      ...addParameterIfDefined('repetition_penalty', 'repetition_penalty'),
      ...addParameterIfDefined('presence_penalty', 'presence_penalty'),
      ...addParameterIfDefined('frequency_penalty', 'frequency_penalty'),
    };

    return params;
  }

  /**
   * Common error handling wrapper for execute methods
   */
  private async executeWithErrorHandling<T>(
    request: GenerateContentParameters,
    userPromptId: string,
    isStreaming: boolean,
    executor: (
      openaiRequest: OpenAI.Chat.ChatCompletionCreateParams,
      context: RequestContext,
    ) => Promise<T>,
  ): Promise<T> {
    const context = this.createRequestContext(userPromptId, isStreaming);
    let attempts = 0;
    const maxAttempts = 2; // Initial attempt + 1 retry

    // Map to track file read attempts for chunking
    const fileReadAttempts = new Map<
      string,
      { offset: number; limit: number; attempts: number }
    >();

    while (attempts < maxAttempts) {
      try {
        const openaiRequest = await this.buildRequest(
          request,
          userPromptId,
          isStreaming,
        );

        const result = await executor(openaiRequest, context);

        context.duration = Date.now() - context.startTime;
        return result;
      } catch (error) {
        // Check for FILE_TOO_LARGE error from tool execution
        const fileTooLargeError = this.extractFileTooLargeError(
          error as GenerateContentResponse, // Assuming error can be a GenerateContentResponse
        );

        if (fileTooLargeError) {
          const { filePath, toolCallId } = fileTooLargeError;
          let fileAttempt = fileReadAttempts.get(filePath);

          if (!fileAttempt) {
            fileAttempt = { offset: 0, limit: DEFAULT_MAX_LINES_TEXT_FILE, attempts: 0 };
            fileReadAttempts.set(filePath, fileAttempt);
          }

          if (fileAttempt.attempts < 5) {
            // Limit to 5 chunks for now
            fileAttempt.attempts++;
            fileAttempt.offset += fileAttempt.limit; // Move to the next chunk

            // Find the original tool call in the request and modify it
            let foundAndModified = false;
            if (Array.isArray(request.contents)) {
              for (const content of request.contents) {
                if (typeof content === 'object' && content !== null && 'parts' in content && Array.isArray(content.parts)) {
                  for (const part of content.parts) {
                    if (
                      'functionCall' in part &&
                      part.functionCall?.name === ToolNames.READ_FILE &&
                      part.functionCall?.id === toolCallId
                    ) {
                      // Modify the existing functionCall to include offset and limit
                      part.functionCall.args = {
                        ...part.functionCall.args,
                        offset: fileAttempt.offset,
                        limit: fileAttempt.limit,
                      };
                      foundAndModified = true;
                      break;
                    }
                  }
                }
                if (foundAndModified) break;
              }
            }

            if (foundAndModified) {
              // Add a message to the model indicating a retry with chunking
              const retryMessage: Content = {
                role: 'user',
                parts: [
                  {
                    text: `The previous attempt to read file '${filePath}' failed because it was too large. Retrying with offset: ${fileAttempt.offset} and limit: ${fileAttempt.limit}.`,
                  },
                ],
              };
              if (Array.isArray(request.contents)) {
                request.contents.push(retryMessage);
              } else {
                request.contents = [request.contents as Content, retryMessage];
              }
              continue; // Retry the request
            }
          }
        }

        if (this.isTokenError(error) && attempts < maxAttempts - 1) {
          attempts++;
          // Modify the request to ask for a shorter response
          const retryMessage: Content = {
            role: 'user',
            parts: [
              {
                text: "The previous request failed because it exceeded the model's token limit. Please provide a much shorter and more concise response. If you were asked to process a large file, use the `read_file` tool with the `limit` parameter to read the file in smaller chunks.",
              },
            ],
          };

          let newContents: Content[] = [];
          if (Array.isArray(request.contents)) {
            newContents = request.contents as Content[];
          } else {
            newContents = [request.contents as Content];
          }

          newContents.push(retryMessage);

          // Truncate the history to fit within the token limit
          const model = this.contentGeneratorConfig.model;
          const limit = tokenLimit(model);
          let totalTokens = 0;
          for (const content of newContents) {
            if (typeof content === 'object' && content !== null && 'parts' in content && Array.isArray(content.parts)) {
              for (const part of content.parts) {
                if (part.text) {
                  totalTokens += Math.ceil(part.text.length / 4);
                }
              }
            }
          }

          while (totalTokens > limit && newContents.length > 1) {
            const removedContent = newContents.shift();
            if (removedContent && typeof removedContent === 'object' && removedContent !== null && 'parts' in removedContent && Array.isArray(removedContent.parts)) {
              for (const part of removedContent.parts) {
                if (part.text) {
                  totalTokens -= Math.ceil(part.text.length / 4);
                }
              }
            }
          }

          request.contents = newContents;

          continue; // Retry the request
        }
        // Use shared error handling logic for non-token errors or final attempt
        return await this.handleError(
          error,
          context,
          request,
          userPromptId,
          isStreaming,
        );
      }
    }

    // This part should not be reachable, but as a fallback:
    throw new Error('Max retry attempts reached.');
  }

  /**
   * Shared error handling logic for both executeWithErrorHandling and processStreamWithLogging
   * This centralizes the common error processing steps to avoid duplication
   */
  private async handleError(
    error: unknown,
    context: RequestContext,
    request: GenerateContentParameters,
    userPromptId?: string,
    isStreaming?: boolean,
  ): Promise<never> {
    context.duration = Date.now() - context.startTime;

    // Build request for logging (may fail, but we still want to log the error)
    let openaiRequest: OpenAI.Chat.ChatCompletionCreateParams;
    try {
      if (userPromptId !== undefined && isStreaming !== undefined) {
        openaiRequest = await this.buildRequest(
          request,
          userPromptId,
          isStreaming,
        );
      } else {
        // For processStreamWithLogging, we don't have userPromptId/isStreaming,
        // so create a minimal request
        openaiRequest = {
          model: this.contentGeneratorConfig.model,
          messages: [],
        };
      }
    } catch (_buildError) {
      // If we can't build the request, create a minimal one for logging
      openaiRequest = {
        model: this.contentGeneratorConfig.model,
        messages: [],
      };
    }

    await this.config.telemetryService.logError(context, error, openaiRequest);
    this.config.errorHandler.handle(error, context, request);
  }

  private isTokenError(error: unknown): boolean {
    if (!error) return false;

    const errorMessage =
      error instanceof Error
        ? error.message.toLowerCase()
        : String(error).toLowerCase();

    return (
      errorMessage.includes('token') &&
      (errorMessage.includes('exceeds') ||
        errorMessage.includes('limit') ||
        errorMessage.includes('maximum') ||
        errorMessage.includes('context length'))
    );
  }

  /**
   * Create request context with common properties
   */
  private createRequestContext(
    userPromptId: string,
    isStreaming: boolean,
  ): RequestContext {
    return {
      userPromptId,
      model: this.contentGeneratorConfig.model,
      authType: this.contentGeneratorConfig.authType || 'unknown',
      startTime: Date.now(),
      duration: 0,
      isStreaming,
    };
  }

  private extractFileTooLargeError(
    response: GenerateContentResponse,
  ): { toolCallId: string; filePath: string } | null {
    if (!response.candidates) {
      return null;
    }

    for (const candidate of response.candidates) {
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if ('functionResponse' in part && part.functionResponse) {
            const funcResponse = part.functionResponse;
            if (
              funcResponse.name === ToolNames.READ_FILE &&
              typeof funcResponse.response === 'object' &&
              funcResponse.response !== null &&
              'errorType' in funcResponse.response &&
              (funcResponse.response as { errorType: string }).errorType ===
                ToolErrorType.FILE_TOO_LARGE
            ) {
              // Assuming the original request's arguments are available in the response
              // This might need adjustment based on how the tool output is structured
              const originalArgs = (funcResponse.response as {
                originalArgs?: ReadFileToolParams;
              }).originalArgs;
              if (originalArgs?.absolute_path && funcResponse.id) {
                return {
                  toolCallId: funcResponse.id,
                  filePath: originalArgs.absolute_path,
                };
              }
            }
          }
        }
      }
    }
    return null;
  }
}