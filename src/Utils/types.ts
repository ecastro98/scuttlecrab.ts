export type SummonerBasicData = {
  accountId: string;
  profileIconId: number;
  revisionDate: number;
  name: string;
  id: string;
  puuid: string;
  summonerLevel: number;
};

export type ObjectChampion = {
  version: string;
  id: number;
  key: string;
  name: string;
  title: string;
  blurb: string;
  lore: string;
  info: InfoChampion;
  image: ImageChampion;
  // tags: Array<TagsChampion>;
  tags: any;
  partype: string;
  stats: StatsChampion;
  skins: Array<string>;
  allytips: Array<string>;
  enemytips: Array<string>;
};

export type StatsChampion = {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
};

export type InfoChampion = {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
};

export type TagsChampion = {
  Mage: string;
  Marksman: string;
  Support: string;
  Fighter: string;
  Tank: string;
  Assassin: string;
};

export type ImageChampion = {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type mostPlayedChampion = {
  name: string;
  points: number;
  level: number;
};

export type rankedData = {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  queueType: string;
};

export type RankedData = rankedData;

export type queueTypes = {
  queueId: number;
  map: string;
  description: string;
  notes: string;
};

export enum mostPlayed {
  DEFAULT = '3',
  HISTORY = '20',
  ALL = 'ALL',
}

export type Team = {
  summonerName: string;
  championName: string;
  spells: {
    one: number;
    two: number;
  };
};

export type Bans = {
  championId: number;
  teamId: number;
  pickTurn: number;
};

export type CurrentGameInfo = {
  userTeam: Array<Team>;
  enemyTeam: Array<Team>;
  gameId: number;
  mapId: number;
  bans: Array<Bans>;
  startTimeGame: number;
  gameMode: string;
  gameQueueConfigId: number;
};

export type Queue = {
  queueId: number;
  map: string;
  description: string;
};

export type RankedInfo = {
  solo?: rankedData[];
  flex?: rankedData[];
};

export type TwoRegion = {
  regions: string[];
  value: string;
};

export type DataRanked = {
  solo: [];
  flex: [];
};
