import { config } from 'dotenv';
config();

import { CommandClient, ShardClient } from 'detritus-client';

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
  imageFormat: 'png',
});

const ScuttleCommandClient = new CommandClient(ScuttleClient, {
  prefix: prefix,
  ignoreMe: true,
  useClusterClient: false,
  activateOnEdits: true,
});

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
  console.log(`Bot Online.\nRunning on node '${process.version}'.`);
})();
