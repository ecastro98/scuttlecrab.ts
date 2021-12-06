import 'dotenv/config';
import {
  CommandClient,
  ShardClient,
  InteractionCommandClient,
} from 'detritus-client';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Logger } from '@dimensional-fun/logger';
const log = new Logger('🤖', {
  defaults: { timestamp: false },
});

interface EventImport {
  default: {
    name: string;
    run(payload: any, commandClient: CommandClient): void | Promise<void>;
  };
}

const ScuttleClient = new ShardClient(process.env.token as string, {
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

      log.info(`Loaded event '${file.name.split('.')[0]}' to Command Client.`);
    }
  } catch (e) {
    console.error(e);
  }
}

(async () => {
  // const usage = process.memoryUsage();
  // const bytes = 100 * 100 * 100;

  await ScuttleClient.run();
  ScuttleClient.gateway.setPresence({
    activity: {
      name: 'with Detritus',
      type: 0,
    },
    status: 'dnd',
  });
  await ScuttleCommandClient.addMultipleIn('./Commands', {
    subdirectories: true,
  })
    .then(async ({ commands }) => {
      log.info(`Loaded ${commands.length.toString()} Commands.`);
    })
    .catch((err) => console.error(err));

  await ScuttleInteractionCommandClient.addMultipleIn('./InteractionCommands', {
    subdirectories: true,
  })
    .then(async ({ commands }) => {
      log.info(`Loaded ${commands.length.toString()} Slash Commands.`);
    })
    .catch((err) => console.error(err));
  await ScuttleCommandClient.run();
  await ScuttleInteractionCommandClient.run();
  await runEvents();
  log.info(`${ScuttleClient.user!.tag} is ready.`);
  // log.info(`Heap Used: ${(usage.heapUsed / bytes).toFixed(2)}mb.`);
  // log.info(`Heap Total: ${(usage.heapTotal / bytes).toFixed(2)}mb.`);
  // log.info(`Memory Usage RSS: ${(usage.rss / bytes).toFixed(2)}mb.`);
})();
