/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { DnsResolutionOrder } from './config/settings.js';
export declare function validateDnsResolutionOrder(order: string | undefined): DnsResolutionOrder;
export declare function setupUnhandledRejectionHandler(): void;
export declare function main(): Promise<void>;
