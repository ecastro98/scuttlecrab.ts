import { createClient } from 'redis';
import { Logger } from '@dimensional-fun/logger';

const log = new Logger('📚', {
  defaults: {
    timestamp: new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City',
    }),
  },
});

export const RedisClient = createClient();

RedisClient.on('connect', () => log.info('Redis Client Connected.'));
RedisClient.on('error', (err) => log.error('Redis Client Error', err));
RedisClient.on('reconnecting', () => log.info('Redis Client Reconnecting...'));
