import { createClient } from 'redis';
import { Logger } from '@dimensional-fun/logger';

const log = new Logger('📚', {
  defaults: {
    timestamp: new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City',
    }),
  },
});

const config = {
  url: process.env.REDIS_HOST ?? 'redis://127.0.0.1:6379'
}
export const RedisClient = createClient(config);

RedisClient.on('connect', () => log.info('Redis Client Connected.'));
RedisClient.on('error', (err) => log.error('Redis Client Error', err));
RedisClient.on('reconnecting', () => log.info('Redis Client Reconnecting...'));
