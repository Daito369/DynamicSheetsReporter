// Simple ping endpoint with structured logging

import { withTrace } from '../LoggingService';

export function ping(): string {
  const logger = withTrace();
  logger.info('ping');
  return 'pong';
}

