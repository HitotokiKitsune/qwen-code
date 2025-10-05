/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useEffect, useState } from 'react';

export const WaitingForInputIndicator: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box marginRight={1}>
      <Text color={theme.status.success}>{show ? '▓▓▓▓▓▓▓▓' : '        '}</Text>
    </Box>
  );
};
