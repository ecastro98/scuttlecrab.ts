export const ShardClientConfig = {
  cache: {
    channels: {
      limit: 100,
      expire: 60 * 60 * 1000,
    },
    messages: {
      limit: 10,
      expire: 5 * 60000,
    },
    members: {
      limit: 1000,
      expire: 5 * 60000,
    },
    voiceStates: true,
    emojis: true,
    interactions: false,
    notes: false,
    presences: false,
    roles: true,
    stickers: false,
    voiceConnections: true,
    connectedAccounts: false,
    sessions: false,
    stageInstances: false,
    relationships: false,
    voiceCalls: true,
  },
  imageFormat: 'png',
  gateway: {
    presence: {
      activity: {
        name: "The Summoner's Rift",
        type: 3,
      },
      status: 'dnd',
    },
    intents: 14023,
  },
};

export const CommandClientConfig = {
  prefix: '?',
  ignoreMe: true,
  useClusterClient: false,
  activateOnEdits: true,
};
