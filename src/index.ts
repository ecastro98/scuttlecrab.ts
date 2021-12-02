import 'dotenv/config';

import { CommandClient, ShardClient } from 'detritus-client';
import {
  ClientEvents,
  MarkupTimestampStyles,
} from 'detritus-client/lib/constants';
import { codestring, timestamp } from 'detritus-client/lib/utils/markup';

const { token, prefix } = {
  token: process.env.token,
  prefix: process.env.prefix,
};

const ScuttleClient = new ShardClient(token, {
  cache: {
    channels: {
      limit: 100,
      expire: 60 * 60 * 1000,
    },
    messages: {
      limit: 50,
      expire: 15 * 60000,
    },
    users: false,
    members: false,
    voiceStates: false,
    emojis: false,
    interactions: false,
    notes: false,
    presences: false,
    roles: false,
    stickers: false,
    voiceConnections: false,
  },
  gateway: {
    intents: 14023,
  },
  imageFormat: 'png',
});

const ScuttleCommandClient = new CommandClient(ScuttleClient, {
  prefix: prefix,
  ignoreMe: true,
  useClusterClient: false,
  activateOnEdits: true,
  mentionsEnabled: true,
});

ScuttleCommandClient.on(
  ClientEvents.COMMAND_RAN,
  async ({ command, context }) => {
    if (command.name === 'eval') return;

    const channel = context.guilds
      .get(process.env.guildId)
      .channels.get('915654402394693642');

    if (!channel) return;

    const cmd = codestring(command.name);

    const author = `${codestring(context.user.tag)} | ${codestring(
      context.user.id,
    )}`;

    const guild = `${codestring(context.guild.name)} | ${codestring(
      context.guild.id,
    )}`;

    const date = timestamp(
      context.message.timestampUnix,
      MarkupTimestampStyles.BOTH_LONG,
    );

    const array: Array<string> = [
      '**Command Executed**',
      '\u200B',
      `Command: ${cmd}.`,
      `Author: ${author}.`,
      `Guild: ${guild}.`,
      `Date: ${date}.`,
    ];

    await channel.createMessage({
      content: array.join('\n'),
    });
  },
);

(async () => {
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
      console.log(`Loaded ${commands.length.toString()} Commands.`);
    })
    .catch((err) => console.error(err));
  await ScuttleCommandClient.run();
  console.log(`Bot Online.`);
})();
