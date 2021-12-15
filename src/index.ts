import 'dotenv/config';
import {
  CommandClient,
  ShardClient,
  InteractionCommandClient,
} from 'detritus-client';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Logger } from '@dimensional-fun/logger';
import { RedisClient } from './Cache';
const log = new Logger('🤖', {
  defaults: {
    timestamp: new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City', // 🌮
    }),
  },
});

interface EventImport {
  default: {
    name: string;
    run(payload: any, commandClient: CommandClient): void | Promise<void>;
  };
}

const ScuttleClient = new ShardClient(process.env.token!, {
  cache: {
    channels: {
      limit: 100,
      expire: 60 * 60 * 1000,
    },
    messages: {
      limit: 50,
      expire: 15 * 60000,
    },
    members: {
      limit: 1000,
    },
    voiceStates: false,
    emojis: false,
    interactions: false,
    notes: false,
    presences: false,
    roles: false,
    stickers: false,
    voiceConnections: false,
  },
  imageFormat: 'png',
});

const ScuttleCommandClient = new CommandClient(ScuttleClient, {
  prefix: '?',
  ignoreMe: true,
  useClusterClient: false,
  activateOnEdits: true,
});

const ScuttleInteractionCommandClient = new InteractionCommandClient(
  ScuttleClient,
);

async function runEvents() {
  try {
    const commandClientEvents = readdirSync(
      resolve(__dirname, './Events/Command'),
      {
        withFileTypes: true,
      },
    ).filter(
      (file) =>
        ['js', 'ts'].some((e) => file.name.endsWith(e)) &&
        !file.name.endsWith('.d.ts'),
    );

    for (const file of commandClientEvents) {
      const ret: EventImport = await import(
        resolve(__dirname, `./Events/Command/${file.name}`)
      );

      ScuttleCommandClient.on(ret.default.name, (payload) =>
        ret.default.run(payload, ScuttleCommandClient),
      );
    }
  } catch (e) {
    console.error(e);
  }
}
// This code is running the ScuttleClient.run() function, which starts up the client and sets it to ready state. The require('./Database/index') line imports all of our database files into this file so that we can use them in other parts of the code. This also sets a presence for our bot with an activity name and type (0 = playing).
(async () => {
  await ScuttleClient.run();
  require('./Database/index');
  ScuttleClient.gateway.setPresence({
    activity: {
      name: 'Powered by Riot Games API',
      type: 0,
    },
    status: 'dnd',
  });
  await ScuttleCommandClient.addMultipleIn('./Commands/Prefixed', {
    subdirectories: true,
  }).catch((err) => console.error(err));

  await ScuttleInteractionCommandClient.addMultipleIn(
    './Commands/Interaction',
    {
      subdirectories: true,
    },
  ).catch((err) => console.error(err));
  await ScuttleCommandClient.run();
  await ScuttleInteractionCommandClient.run();
  await runEvents();
  await RedisClient.connect();
  log.info(`${ScuttleClient.user!.tag} is ready.`);
})();
