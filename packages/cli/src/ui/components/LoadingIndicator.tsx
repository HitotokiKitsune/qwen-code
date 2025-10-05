/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ThoughtSummary } from '@qwen-code/qwen-code-core';
import { useMemo } from 'react';

import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import { useStreamingContext } from '../contexts/StreamingContext.js';
import { StreamingState } from '../types.js';
import { GeminiRespondingSpinner } from './GeminiRespondingSpinner.js';
import { formatDuration } from '../utils/formatters.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { isNarrowWidth } from '../utils/isNarrowWidth.js';

interface LoadingIndicatorProps {
  currentLoadingPhrase?: string;
  elapsedTime: number;
  rightContent?: React.ReactNode;
  thought?: ThoughtSummary | null;
  isWaitingForRetry: boolean;
  retryElapsedTime: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  currentLoadingPhrase,
  elapsedTime,
  rightContent,
  thought,
  isWaitingForRetry,
  retryElapsedTime,
}) => {
  const streamingState = useStreamingContext();
  const { columns: terminalWidth } = useTerminalSize();
  const isNarrow = isNarrowWidth(terminalWidth);

  const cancelAndTimerContent = useMemo(() => {
    const mainTimerText = `(esc to cancel, ${elapsedTime < 60 ? `${elapsedTime}s` : formatDuration(elapsedTime * 1000)})`;
    return <Text color={Colors.Gray}>{mainTimerText}</Text>;
  }, [elapsedTime]);

  const retryTimerContent = useMemo(() => {
    if (!isWaitingForRetry) {
      return null;
    }
    const retryTimerText = retryElapsedTime < 60 ? `${retryElapsedTime}s` : formatDuration(retryElapsedTime * 1000);
    return <Text color={Colors.AccentRed}> {retryTimerText}</Text>;
  }, [isWaitingForRetry, retryElapsedTime]);

  if (streamingState === StreamingState.Idle) {
    return null;
  }

  const primaryText = thought?.subject || currentLoadingPhrase;

  return (
    <Box paddingLeft={0} flexDirection="column">
      {/* Main loading line */}
      <Box
        width="100%"
        flexDirection={isNarrow ? 'column' : 'row'}
        alignItems={isNarrow ? 'flex-start' : 'center'}
      >
        <Box>
          <Box marginRight={1}>
            <GeminiRespondingSpinner
              nonRespondingDisplay={
                streamingState === StreamingState.WaitingForConfirmation ? (
                  <Text color={Colors.AccentGreen}>{"█"}</Text>
                ) : (
                  ''
                )
              }
            />
          </Box>
          {primaryText && (
            <Text color={Colors.AccentPurple}>{primaryText}</Text>
          )}
          {!isNarrow && cancelAndTimerContent && <Box>{cancelAndTimerContent}{retryTimerContent}</Box>}
        </Box>
        {!isNarrow && <Box flexGrow={1}>{/* Spacer */}</Box>}
        {!isNarrow && rightContent && <Box>{rightContent}</Box>}
      </Box>
      {isNarrow && cancelAndTimerContent && <Box>{cancelAndTimerContent}{retryTimerContent}</Box>}
      {isNarrow && rightContent && <Box>{rightContent}</Box>}
    </Box>
  );
};