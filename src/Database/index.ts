import { connect } from 'mongoose';
import { Logger } from '@dimensional-fun/logger';
const log = new Logger('🔥', {
  defaults: {
    timestamp: new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City',
    }),
  },
});

connect(process.env.MONGO_URI!, (error) => {
  if (error) return log.error(error);
  log.info('Database Connected.');
});
