export const ShardClientConfig = {
  cache: {
    channels: {
      limit: 100,
      expire: 60 * 60 * 1000,
    },
    messages: {
      expire: 5 * 60000,
    },
    members: {
      limit: 1000,
      expire: 5 * 60000,
    },
    voiceStates: false,
    emojis: false,
    interactions: false,
    notes: false,
    presences: false,
    roles: true,
    stickers: false,
    voiceConnections: false,
    connectedAccounts: false,
    sessions: false,
    stageInstances: false,
    relationships: false,
    voiceCalls: false,
  },
  imageFormat: 'png',
  gateway: {
    presence: {
      activity: {
        name: "The Summoner's Rift | Prefix: '?'",
        type: 3,
      },
      status: 'dnd',
    },
    intents: 4753,
  },
};

export const CommandClientConfig = {
  prefix: '?',
  ignoreMe: true,
  useClusterClient: false,
  activateOnEdits: true,
};
