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
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: InfoChampion;
  image: ImageChampion;
  tags: TagsChampion;
  partype: string;
  stats: StatsChampion;
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
  '0': string;
  '1': string;
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
  spell: Array<any>;
  bans: Array<any>;
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
