import { Permissions } from 'detritus-client/lib/constants';

export const DiscordPermissions = {
  [String(Permissions.NONE)]: 'None',
  [String(Permissions.CREATE_INSTANT_INVITE)]: 'Create Instant Invite',
  [String(Permissions.KICK_MEMBERS)]: 'Kick Members',
  [String(Permissions.BAN_MEMBERS)]: 'Ban Members',
  [String(Permissions.ADMINISTRATOR)]: 'Administrator',
  [String(Permissions.MANAGE_CHANNELS)]: 'Manage Channels',
  [String(Permissions.MANAGE_GUILD)]: 'Manage Guild',
  [String(Permissions.ADD_REACTIONS)]: 'Add Reactions',
  [String(Permissions.VIEW_AUDIT_LOG)]: 'View Audit Log',
  [String(Permissions.PRIORITY_SPEAKER)]: 'Priority Speaker',
  [String(Permissions.STREAM)]: 'Stream',
  [String(Permissions.VIEW_CHANNEL)]: 'View Channel',
  [String(Permissions.SEND_MESSAGES)]: 'Send Messages',
  [String(Permissions.SEND_TTS_MESSAGES)]: 'Send TTS Messages',
  [String(Permissions.MANAGE_MESSAGES)]: 'Manage Messages',
  [String(Permissions.EMBED_LINKS)]: 'Embed Links',
  [String(Permissions.ATTACH_FILES)]: 'Attach Files',
  [String(Permissions.READ_MESSAGE_HISTORY)]: 'Read Message History',
  [String(Permissions.MENTION_EVERYONE)]: 'Mention Everyone',
  [String(Permissions.USE_EXTERNAL_EMOJIS)]: 'Use External Emojis',
  [String(Permissions.VIEW_GUILD_ANALYTICS)]: 'View Guild Analytics',
  [String(Permissions.CONNECT)]: 'Connect',
  [String(Permissions.SPEAK)]: 'Speak',
  [String(Permissions.MUTE_MEMBERS)]: 'Mute Members',
  [String(Permissions.DEAFEN_MEMBERS)]: 'Deafen Members',
  [String(Permissions.MOVE_MEMBERS)]: 'Move Members',
  [String(Permissions.USE_VAD)]: 'Use VAD',
  [String(Permissions.CHANGE_NICKNAME)]: 'Change Nickname',
  [String(Permissions.CHANGE_NICKNAMES)]: 'Change Nicknames',
  [String(Permissions.MANAGE_ROLES)]: 'Manage Roles',
  [String(Permissions.MANAGE_WEBHOOKS)]: 'Manage Webhooks',
  [String(Permissions.MANAGE_EMOJIS)]: 'Manage Emojis',
  [String(Permissions.USE_APPLICATION_COMMANDS)]: 'Use Application Commands',
  [String(Permissions.REQUEST_TO_SPEAK)]: 'Request To Speak',
  [String(Permissions.MANAGE_EVENTS)]: 'Manage Events',
  [String(Permissions.MANAGE_THREADS)]: 'Manage Threads',
  [String(Permissions.USE_PUBLIC_THREADS)]: 'Use Public Threads',
  [String(Permissions.USE_PRIVATE_THREADS)]: 'Use Private Threads',
  [String(Permissions.USE_EXTERNAL_STICKERS)]: 'Use External Stickers',
  [String(Permissions.SEND_MESSAGES_IN_THREADS)]: 'Send Messages In Threads',
};

export enum CommandTypes {
  MISC = 'Misc',
  IMG = 'Image',
  INFO = 'Information',
  PRIVATE = 'Private',
  UTIL = 'Util',
  LOL = 'League of Legends',
  DOCS = 'Detritus Client',
  MUSIC = 'Music',
}

export enum EmbedColors {
  DEFAULT = 0x0762ff,
  ERROR = 0xff0000,
  SUCCESS = 0x3aff00,
}

//League of Legends
export const LolApiErrors = {
  [String(400)]:
    'It has not been possible to obtain the information because the request or request was incorrect. Try again.',
  [String(401)]:
    'The information could not be obtained as the "Development API Key" provided by Riot Games has expired. Report on the [support server](https://discord.gg/pE6efwjXYJ).',
  [String(404)]: "That summoner couldn't be found, at least on that region.",
};

export const LolRegions = {
  [String('ru')]: 'ru',
  [String('kr')]: 'kr',
  [String('lan')]: 'la1',
  [String('las')]: 'la2',
  [String('oce')]: 'oc1',
  [String('eune')]: 'eun1',
};

export const twoLolRegions = {
  1: {
    regions: ['kr', 'jp'],
    value: 'https://asia.api.riotgames.com/lol',
  },
  2: {
    regions: ['ru', 'eune', 'euw', 'tr'],
    value: 'https://europe.api.riotgames.com/lol',
  },
  3: {
    regions: ['lan', 'las', 'oc', 'na', 'br'],
    value: 'https://americas.api.riotgames.com/lol',
  },
};

export const ChoicesRegion = [
  {
    name: 'LAN',
    value: 'lan',
  },
  {
    name: 'LAS',
    value: 'las',
  },
  {
    name: 'NA',
    value: 'na',
  },
  {
    name: 'RU',
    value: 'ru',
  },
  {
    name: 'OCE',
    value: 'oc',
  },
  {
    name: 'KR',
    value: 'kr',
  },
  {
    name: 'JP',
    value: 'jp',
  },
  {
    name: 'EUW',
    value: 'euw',
  },
  {
    name: 'EUNE',
    value: 'eun',
  },
  {
    name: 'BR',
    value: 'br',
  },
];

export const OPRegions = {
  [String('lan')]: 'lan',
  [String('las')]: 'las',
  [String('na')]: 'na',
  [String('kr')]: 'www',
  [String('tr')]: 'tr',
  [String('jp')]: 'jp',
  [String('ru')]: 'ru',
  [String('oc')]: 'oce',
  [String('euw')]: 'euw',
  [String('eun')]: 'eune',
  [String('br')]: 'br',
};

export const URegions = {
  [String('ru')]: 'ru',
  [String('kr')]: 'kr',
  [String('lan')]: 'la1',
  [String('las')]: 'la2',
  [String('oc')]: 'oc1',
  [String('eun')]: 'eun1',
  [String('na')]: 'na',
  [String('euw')]: 'euw1',
  [String('br')]: 'br1',
  [String('jp')]: 'jp',
};

// podria ser sin T | string
export const makeUrl = {
  opgg: (region: keyof typeof OPRegions | string, username: string) => {
    return `https://${region}.op.gg/summoner/userName=${username}`;
  },
  ugg: (region: keyof typeof URegions | string, username: string) => {
    return `https://u.gg/lol/profile/${region}/${username}/overview`;
  },
};

export enum Role {
  TOP = 'TOP',
  MID = 'MID',
  ADC = 'ADC',
  SUP = 'SUP',
  JNG = 'JNG',
}

export enum Spells {
  HEAL = 'Heal',
  GHOST = 'Ghost',
  BARRIER = 'Barrier',
  EXHAUST = 'Exhaust',
  MARK = 'Mark',
  DASH = 'Dash',
  CLARITY = 'Clarity',
  FLASH = 'Flash',
  TELEPORT = 'Teleport',
  SMITE = 'Smite',
  CLEANSE = 'Cleanse',
  IGNITE = 'Ignite',
}

export enum Modifier {
  CAREFUL = 'CAREFUL',
  CARELESS = 'CARELESS',
  FRIENDLY = 'FRIENDLY',
  CONTRARIAN = 'CONTRARIAN',
  GODLIKE = 'GODLIKE',
  BAD = 'BAD',
}

export enum Alignment {
  PLAYER = 'PLAYER',
  ALLY = 'ALLY',
  ENEMY = 'ENEMY',
}

export enum Event {
  CHAMPION_INIT = 'CHAMPION_INIT',
  KILL = 'KILL',
  DEATH = 'DEATH',
  ASSIST = 'ASSIST',
  TEAMFIGHT_SETUP = 'TEAMFIGHT_SETUP',
  TEAMFIGHT = 'TEAMFIGHT',
  SOLOFIGHT = 'SOLOFIGHT',
  SPLITPUSH = 'SPLITPUSH',
}

export enum URLS {
  ALL_CHAMPION_JSON = 'http://ddragon.leagueoflegends.com/cdn/11.21.1/data/en_US/champion.json',
  CHAMPION_ICON = 'http://ddragon.leagueoflegends.com/cdn/11.24.1/img/champion/',
  CHAMPION_SPLASH = 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/',
}

export const QueueTypes = [
  {
    queueId: 0,
    map: 'Custom games',
    description: 'Custom games',
  },
  {
    queueId: 2,
    map: "Summoner's Rift",
    description: '5v5 Blind Pick',
  },
  {
    queueId: 4,
    map: "Summoner's Rift",
    description: '5v5 Ranked Solo',
  },
  {
    queueId: 6,
    map: "Summoner's Rift",
    description: '5v5 Ranked Premade',
  },
  {
    queueId: 7,
    map: "Summoner's Rift",
    description: 'Co-op vs AI',
  },
  {
    queueId: 8,
    map: 'Twisted Treeline',
    description: '3v3 Normal',
  },
  {
    queueId: 9,
    map: 'Twisted Treeline',
    description: '3v3 Ranked Flex',
  },
  {
    queueId: 14,
    map: "Summoner's Rift",
    description: '5v5 Draft Pick',
  },
  {
    queueId: 16,
    map: 'Crystal Scar',
    description: '5v5 Dominion Blind Pick',
  },
  {
    queueId: 17,
    map: 'Crystal Scar',
    description: '5v5 Dominion Draft Pick',
  },
  {
    queueId: 25,
    map: 'Crystal Scar',
    description: 'Dominion Co-op vs AI',
  },
  {
    queueId: 31,
    map: "Summoner's Rift",
    description: 'Co-op vs AI Intro Bot',
  },
  {
    queueId: 32,
    map: "Summoner's Rift",
    description: 'Co-op vs AI Beginner Bot',
  },
  {
    queueId: 33,
    map: "Summoner's Rift",
    description: 'Co-op vs AI Intermediate Bot',
  },
  {
    queueId: 41,
    map: 'Twisted Treeline',
    description: '3v3 Ranked Team',
  },
  {
    queueId: 42,
    map: "Summoner's Rift",
    description: '5v5 Ranked Team',
  },
  {
    queueId: 52,
    map: 'Twisted Treeline',
    description: 'Co-op vs AI',
  },
  {
    queueId: 61,
    map: "Summoner's Rift",
    description: '5v5 Team Builder',
  },
  {
    queueId: 65,
    map: 'Howling Abyss',
    description: '5v5 ARAM',
  },
  {
    queueId: 67,
    map: 'Howling Abyss',
    description: 'ARAM Co-op vs AI',
  },
  {
    queueId: 70,
    map: "Summoner's Rift",
    description: 'One for All',
  },
  {
    queueId: 72,
    map: 'Howling Abyss',
    description: '1v1 Snowdown Showdown',
  },
  {
    queueId: 73,
    map: 'Howling Abyss',
    description: '2v2 Snowdown Showdown',
  },
  {
    queueId: 75,
    map: "Summoner's Rift",
    description: '6v6 Hexakill',
  },
  {
    queueId: 76,
    map: "Summoner's Rift",
    description: 'Ultra Rapid Fire',
  },
  {
    queueId: 78,
    map: 'Howling Abyss',
    description: 'One For All: Mirror Mode',
  },
  {
    queueId: 83,
    map: "Summoner's Rift",
    description: 'Co-op vs AI Ultra Rapid Fire',
  },
  {
    queueId: 91,
    map: "Summoner's Rift",
    description: 'Doom Bots Rank 1',
  },
  {
    queueId: 92,
    map: "Summoner's Rift",
    description: 'Doom Bots Rank 2',
  },
  {
    queueId: 93,
    map: "Summoner's Rift",
    description: 'Doom Bots Rank 5',
  },
  {
    queueId: 96,
    map: 'Crystal Scar',
    description: 'Ascension',
  },
  {
    queueId: 98,
    map: 'Twisted Treeline',
    description: '6v6 Hexakill',
  },
  {
    queueId: 100,
    map: "Butcher's Bridge",
    description: '5v5 ARAM',
  },
  {
    queueId: 300,
    map: 'Howling Abyss',
    description: 'Legend of the Poro King',
  },
  {
    queueId: 310,
    map: "Summoner's Rift",
    description: 'Nemesis',
  },
  {
    queueId: 313,
    map: "Summoner's Rift",
    description: 'Black Market Brawlers',
  },
  {
    queueId: 315,
    map: "Summoner's Rift",
    description: 'Nexus Siege',
  },
  {
    queueId: 317,
    map: 'Crystal Scar',
    description: 'Definitely Not Dominion',
  },
  {
    queueId: 318,
    map: "Summoner's Rift",
    description: 'ARURF',
  },
  {
    queueId: 325,
    map: "Summoner's Rift",
    description: 'All Random',
  },
  {
    queueId: 400,
    map: "Summoner's Rift",
    description: '5v5 Draft Pick',
  },
  {
    queueId: 410,
    map: "Summoner's Rift",
    description: '5v5 Ranked Dynamic',
  },
  {
    queueId: 420,
    map: "Summoner's Rift",
    description: '5v5 Ranked Solo',
  },
  {
    queueId: 430,
    map: "Summoner's Rift",
    description: '5v5 Blind Pick',
  },
  {
    queueId: 440,
    map: "Summoner's Rift",
    description: '5v5 Ranked Flex',
  },
  {
    queueId: 450,
    map: 'Howling Abyss',
    description: '5v5 ARAM',
  },
  {
    queueId: 460,
    map: 'Twisted Treeline',
    description: '3v3 Blind Pick',
  },
  {
    queueId: 470,
    map: 'Twisted Treeline',
    description: '3v3 Ranked Flex',
  },
  {
    queueId: 600,
    map: "Summoner's Rift",
    description: 'Blood Hunt Assassin',
  },
  {
    queueId: 610,
    map: 'Cosmic Ruins',
    description: 'Dark Star: Singularity',
  },
  {
    queueId: 700,
    map: "Summoner's Rift",
    description: 'Clash',
  },
  {
    queueId: 800,
    map: 'Twisted Treeline',
    description: 'Co-op vs. AI Intermediate Bot',
  },
  {
    queueId: 810,
    map: 'Twisted Treeline',
    description: 'Co-op vs. AI Intro Bot',
  },
  {
    queueId: 820,
    map: 'Twisted Treeline',
    description: 'Co-op vs. AI Beginner Bot',
  },
  {
    queueId: 830,
    map: "Summoner's Rift",
    description: 'Co-op vs. AI Intro Bot',
  },
  {
    queueId: 840,
    map: "Summoner's Rift",
    description: 'Co-op vs. AI Beginner Bot',
  },
  {
    queueId: 850,
    map: "Summoner's Rift",
    description: 'Co-op vs. AI Intermediate Bot',
  },
  {
    queueId: 900,
    map: "Summoner's Rift",
    description: 'URF',
  },
  {
    queueId: 910,
    map: 'Crystal Scar',
    description: 'Ascension',
  },
  {
    queueId: 920,
    map: 'Howling Abyss',
    description: 'Legend of the Poro King',
  },
  {
    queueId: 940,
    map: "Summoner's Rift",
    description: 'Nexus Siege',
  },
  {
    queueId: 950,
    map: "Summoner's Rift",
    description: 'Doom Bots Voting',
  },
  {
    queueId: 960,
    map: "Summoner's Rift",
    description: 'Doom Bots Standard',
  },
  {
    queueId: 980,
    map: 'Valoran City Park',
    description: 'Star Guardian Invasion: Normal',
  },
  {
    queueId: 990,
    map: 'Valoran City Park',
    description: 'Star Guardian Invasion: Onslaught',
  },
  {
    queueId: 1000,
    map: 'Overcharge',
    description: 'PROJECT: Hunters',
  },
  {
    queueId: 1010,
    map: "Summoner's Rift",
    description: 'Snow ARURF',
  },
  {
    queueId: 1020,
    map: "Summoner's Rift",
    description: 'One for All',
  },
  {
    queueId: 1030,
    map: 'Crash Site',
    description: 'Odyssey Extraction: Intro',
  },
  {
    queueId: 1040,
    map: 'Crash Site',
    description: 'Odyssey Extraction: Cadet',
  },
  {
    queueId: 1050,
    map: 'Crash Site',
    description: 'Odyssey Extraction: Crewmember',
  },
  {
    queueId: 1060,
    map: 'Crash Site',
    description: 'Odyssey Extraction: Captain',
  },
  {
    queueId: 1070,
    map: 'Crash Site',
    description: 'Odyssey Extraction: Onslaught',
  },
  {
    queueId: 1090,
    map: 'Convergence',
    description: 'Teamfight Tactics',
  },
  {
    queueId: 1100,
    map: 'Convergence',
    description: 'Ranked Teamfight Tactics',
  },
  {
    queueId: 1110,
    map: 'Convergence',
    description: 'Teamfight Tactics Tutorial',
  },
  {
    queueId: 1111,
    map: 'Convergence',
    description: 'Teamfight Tactics test',
  },
  {
    queueId: 1200,
    map: 'Nexus Blitz',
    description: 'Nexus Blitz',
  },
  {
    queueId: 1300,
    map: 'Nexus Blitz',
    description: 'Nexus Blitz',
  },
  {
    queueId: 1400,
    map: "Summoner's Rift",
    description: 'Ultimate Spellbook',
  },
  {
    queueId: 2000,
    map: "Summoner's Rift",
    description: 'Tutorial 1',
  },
  {
    queueId: 2010,
    map: "Summoner's Rift",
    description: 'Tutorial 2',
  },
  {
    queueId: 2020,
    map: "Summoner's Rift",
    description: 'Tutorial 3',
  },
];
