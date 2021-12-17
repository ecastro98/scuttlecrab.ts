import 'dotenv/config';
import {
  ShardClient,
  CommandClient,
  InteractionCommandClient,
} from 'detritus-client';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Logger } from '@dimensional-fun/logger';
import { Manager } from 'erela.js';
import { RedisClient } from './Cache';
import { CommandClientConfig, ShardClientConfig } from './Config';
const log = new Logger('🤖', {
  defaults: {
    timestamp: new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City',
    }),
  },
});

interface EventImport {
  default: {
    name: string;
    run(payload: any, commandClient: CommandClient): void | Promise<void>;
  };
}

const ScuttleClient = new ShardClient(process.env.token!, ShardClientConfig);

const ScuttleCommandClient = new CommandClient(
  ScuttleClient,
  CommandClientConfig,
);

const ScuttleInteractionCommandClient = new InteractionCommandClient(
  ScuttleClient,
);

export const ScuttleMusicManager = new Manager({
  nodes: [
    {
      host: 'localhost',
      password: 'youshallnotpass',
      port: 3002,
    },
  ],
  clientName: 'ScuttleMusicManager',
  send(_, payload) {
    ScuttleClient.gateway.send(payload.op, payload.d);
  },
});

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

ScuttleClient.on('raw', (x) => {
  ScuttleMusicManager.updateVoiceState(x);
});

(async () => {
  await ScuttleClient.run();
  require('./Database/index');
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
  ScuttleMusicManager.init(ScuttleClient.user!.id);
})();
