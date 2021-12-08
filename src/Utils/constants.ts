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
}

export enum EmbedColors {
  DEFAULT = 0xae25ff,
  ERROR = 0xff0000,
  SUCCESS = 0x3aff00,
}

//League of Legends
export const LolApiErrors = {
  400: 'It has not been possible to obtain the information because the request or request was incorrect. Try again.',
  401: 'The information could not be obtained as the "Development API Key" provided by Riot Games has expired. Report on the [support server](https://discord.gg/pE6efwjXYJ).',
  404: 'This user does not exist in the current region.',
};

export const LolRegions: any = {
  ru: 'ru',
  kr: 'kr',
  lan: 'la1',
  las: 'la2',
  oce: 'oc1',
  eune: 'eun1',
};

export const twoLolRegions: any = {
  1: {
    regions: ['kr', 'jp'],
    value: 'https://asia.api.riotgames.com/lol',
  },
  2: {
    regions: ['ru', 'eune', 'euw', 'tr'],
    value: 'https://europe.api.riotgames.com/lol',
  },
  3: {
    regions: ['lan', 'las', 'oce', 'na', 'br'],
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
    name: 'OC',
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
    name: 'EUN',
    value: 'eun',
  },
  {
    name: 'BR',
    value: 'br',
  },
];

export const OPRegions: any = {
  LAN: 'lan',
  LAS: 'las',
  NA: 'na',
  KR: 'www',
  TR: 'tr',
  JP: 'jp',
  RU: 'ru',
  OC: 'oce',
  EUW: 'euw',
  EUN: 'eune',
  BR: 'br',
};

export const URegions: any = {
  ru: 'ru',
  kr: 'kr',
  lan: 'la1',
  las: 'la2',
  oce: 'oc1',
  eune: 'eun1',
  na: 'na',
  euw: 'euw1',
  br: 'br1',
  jp: 'jp',
};

interface makeUrl {
  opgg: (region: string, username: string) => string;
  ugg: (region: string, username: string) => string;
}

export const makeUrl: makeUrl = {
  opgg: (region, username) => {
    return `https://${region}.op.gg/summoner/userName=${username}`;
  },
  ugg: (region, username) => {
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
  CHAMPION_ICON = 'http://ddragon.leagueoflegends.com/cdn/11.23.1/img/champion/',
  CHAMPION_SPLASH = 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/',
}
