import 'dotenv/config';

import { CommandClient, ShardClient, Utils } from 'detritus-client';
import {
  ClientEvents,
  MarkupTimestampStyles,
} from 'detritus-client/lib/constants';
const { Markup } = Utils;

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

    const channel = context.guilds.cache
      .get(process.env.guildId)
      .channels.cache.get('915654402394693642');

    const date = Markup.timestamp(
      context.message.timestampUnix,
      MarkupTimestampStyles.BOTH_LONG,
    );

    const array: Array<string> = [
      '**Command Executed**',
      '',
      `Command: ${Markup.codestring(command.name)}.`,
      `Author: ${Markup.codestring(context.user.tag)} | ${Markup.codestring(
        context.user.id,
      )}.`,
      `Guild: ${Markup.codestring(context.guild.name)} | ${Markup.codestring(
        context.guild.id,
      )}.`,
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
