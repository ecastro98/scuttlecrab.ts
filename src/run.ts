import 'dotenv/config';
import {
  ShardClient,
  CommandClient,
  InteractionCommandClient,
} from 'detritus-client';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Logger } from '@dimensional-fun/logger';
// import { Manager } from 'erela.js';
import { RedisClient } from './Cache';
import { CommandClientConfig, ShardClientConfig } from './Config';
import { bold, codestring, underline } from 'detritus-client/lib/utils/markup';
import { EmbedColors } from './Utils/constants';
import {
  ChannelTypes,
  ClientEvents,
  Permissions,
} from 'detritus-client/lib/constants';
import { Embed } from 'detritus-client/lib/utils';
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

// export const ScuttleMusicManager = new Manager({
//   nodes: [
//     {
//       host: 'localhost',
//       password: 'youshallnotpass',
//       port: 3002,
//     },
//   ],
//   clientName: 'ScuttleMusicManager',
//   send(_, payload) {
//     ScuttleClient.gateway.send(payload.op, payload.d);
//   },
// })
//   .on('trackStart', async (player, track) => {
//     const channel = ScuttleClient.channels.get(player.textChannel!);
//     if (!channel) return;

//     if (channel) {
//       await channel.createMessage({
//         embeds: [
//           {
//             description: `${Emojis.PLAY} Now playing [${codestring(
//               removeMarkdown(track.title),
//             )}](${track.uri}), requested by ${codestring(
//               (track.requester as User).tag,
//             )}.`,
//             color: EmbedColors.DEFAULT,
//           },
//         ],
//       });
//     }
//   })
//   .on('trackEnd', async (player, track) => {
//     const channel = ScuttleClient.channels.get(player.textChannel!);
//     if (!channel) return;

//     if (channel) {
//       await channel
//         .createMessage({
//           embeds: [
//             {
//               description: `${Emojis.END} [${codestring(
//                 removeMarkdown(track.title),
//               )}](${track.uri}) requested by ${codestring(
//                 (track.requester as User).tag,
//               )} has ended.`,
//               color: EmbedColors.DEFAULT,
//             },
//           ],
//         })
//         .then((msg) => {
//           setTimeout(async () => {
//             await msg.delete().catch(() => null);
//           }, 10000);
//         })
//         .catch(() => null);
//     }
//   })
//   .on('queueEnd', async (player, track) => {
//     const channel = ScuttleClient.channels.get(player.textChannel!);
//     if (player) player.destroy();
//     if (!channel) return;

//     if (channel) {
//       await channel
//         .createMessage({
//           embeds: [
//             {
//               description: `${Emojis.END} The queue has ended, thanks for listening.`,
//               color: EmbedColors.DEFAULT,
//             },
//           ],
//         })
//         .then((msg) => {
//           setTimeout(async () => {
//             await msg.delete().catch(() => null);
//           }, 20000);
//         })
//         .catch(() => null);
//     }
//   });

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

ScuttleClient.on(ClientEvents.GUILD_CREATE, ({ fromUnavailable, guild }) => {
  if (fromUnavailable) return;

  const channel = guild.channels
    .filter((x) => x.type === ChannelTypes.GUILD_TEXT)
    .filter((x) =>
      x.can(
        [Permissions.SEND_MESSAGES, Permissions.EMBED_LINKS],
        guild.members.get(ScuttleClient.userId),
      ),
    );

  if (!channel.length) return;

  channel[0]
    .createMessage({
      embeds: [
        new Embed()
          .setColor(EmbedColors.DEFAULT)
          .setTitle(underline(ScuttleClient.user!.tag))
          .setDescription(
            `Hello, I'm ${bold(
              ScuttleClient.user!.username,
            )}, a League of Legends Discord Bot created by ${ScuttleClient.owners
              .map((x) => codestring(x.tag))
              .join(' and ')}.\n\nStart using me by using ${codestring(
              ' /help ',
            )} to view all commands.
            `,
          )
          .setThumbnail(
            ScuttleClient.user!.avatarUrlFormat('png', { size: 128 }),
          ),
      ],
    })
    .catch(() => null);
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
  // ScuttleMusicManager.init(ScuttleClient.user!.id);
})();
