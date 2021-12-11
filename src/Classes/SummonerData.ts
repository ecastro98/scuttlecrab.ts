import axios from 'axios';
import fabricio from '@fabricio-191/ms';
import { Logger } from '@dimensional-fun/logger';
import { LolApiErrors, LolRegions, twoLolRegions } from '../Utils/constants';
import { ObjectChampion, SummonerBasicData, mostPlayed, mostPlayedChampion, queueTypes, CurrentGameInfo, RankedInfo } from '../Utils/types';
import { RedisClient } from '../Cache';

const log = new Logger('🎮', {
  defaults: {
    timestamp: new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City',
    }),
  },
});

const RiotToken = process.env.RIOT_API_TOKEN;

export class SummonerData {
  region: string;
  baseURL: string;
  username: string;
  currentPatch!: string;
  matchesURL: string;
  constructor(region: string, username: string) {
    this.region = SummonerData.Region(region);
    this.baseURL = `https://${this.region}.api.riotgames.com/lol`;
    this.username = username;
    this.matchesURL = SummonerData.twoRegion(region);
  }

  static Region(region: string): string {
    region = region.toLocaleLowerCase();
    const parser = LolRegions[region];
    if (!parser) return `${region}1`;
    return parser;
  }

  static twoRegion(region: string): string {
    region = region.toLowerCase();
    const result: any = Object.values(twoLolRegions).find((v: any) =>
      v.regions.includes(region),
    );
    return result?.value!;
  }

  async profileBasicData(): Promise<SummonerBasicData> {
    const get = await RedisClient.get(
      `basicData:${this.username.toLowerCase()}_${this.region}`,
    );
    if (get) return JSON.parse(get);

    try {
      const url = `${
        this.baseURL
      }/summoner/v4/summoners/by-name/${encodeURIComponent(
        this.username,
      )}?api_key=${RiotToken}`;
      const { data: basicData } = await axios.get(url);

      await RedisClient.set(
        `basicData:${this.username.toLowerCase()}_${this.region}`,
        JSON.stringify(basicData),
        {
          EX: 600,
        },
      );
      return basicData;
    } catch (err: any) {
      if (err?.response) {
        const error = LolApiErrors[err?.response?.status];
        if (error) {
          throw new Error(error);
        }
        log.error(`ProfileBasicData: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
      log.error(`ProfileBasicData: ${err?.message!}.`);
      throw new Error('An error occurred while trying to retrieve user data.');
    }
  }

  async profileBasicDataBySummonerId(
    summonerId: SummonerBasicData['id'],
  ): Promise<SummonerBasicData> {
    const get = await RedisClient.get(
      `profileBasicDataBySummonerId:${summonerId}`,
    );
    if (get) return JSON.parse(get);

    try {
      const url = `${this.baseURL}/summoner/v4/summoners/${summonerId}?api_key=${RiotToken}`;
      const { data: basicData } = await axios.get(url);
      await RedisClient.set(
        `profileBasicDataBySummonerId:${summonerId}`,
        JSON.stringify(basicData),
        {
          EX: 600,
        },
      );
      return basicData;
    } catch (err: any) {
      if (err?.response) {
        const error = LolApiErrors[err?.response?.status];
        if (error) {
          throw new Error(error);
        }
        log.error(`ProfileBasicDataBySummonerId: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
      log.error(`ProfileBasicDataBySummonerId: ${err?.message!}.`);
      throw new Error('An error occurred while trying to retrieve user data.');
    }
  }

  async getCurrentPatch(): Promise<string> {
    const get = await RedisClient.get('patch:current');
    if (get) return get;

    const url = `https://ddragon.leagueoflegends.com/api/versions.json`;
    const { data } = await axios.get(url);
    this.currentPatch = data[0];

    await RedisClient.set('patch:current', String(data[0]));
    return data[0];
  }

  async getChampionById(id: ObjectChampion['id']): Promise<ObjectChampion> {
    const get = await RedisClient.get(`champion:${id}`);
    if (get) return JSON.parse(get);

    const patch = await this.getCurrentPatch();
    const response = await this.getChampions();
    var champId: any;
    const champions = Object.keys(response);
    champions.forEach((champ) => {
      if (response[champ].key == id) {
        champId = response[champ].id;
      }
    });

    const url_2 = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${champId}.json`;
    const { data: response_2 } = await axios.get(url_2);

    await RedisClient.set(
      `champion:${id}`,
      JSON.stringify(response_2.data[String(champId)]),
    );

    return response_2.data[String(champId)];
  }

  async getChampionByName(
    name: ObjectChampion['name'],
  ): Promise<ObjectChampion> {
    const patch = await this.getCurrentPatch();
    const url = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${name}.json`;
    const { data } = await axios.get(url);
    return data.data[String(name)];
  }

  async advencedMatchInfo(gameId: string) {
    const url = `${this.matchesURL}/match/v5/matches/${gameId}?api_key=${RiotToken}`;
    const { data: match } = await axios.get(url);
    return match;
  }

  async mostPlayedChampions(
    summonerId: SummonerBasicData['id'],
    type: mostPlayed,
  ): Promise<mostPlayedChampion[]> {
    const get = await RedisClient.get(
      `mostPlayedChampions:${summonerId}_${type}`,
    );
    if (get) return JSON.parse(get);

    try {
      const urlMPC = `${this.baseURL}/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}?api_key=${RiotToken}`;
      const { data } = await axios.get(urlMPC);
      const mostPlayedChampions = type == 'ALL' ? data : data.slice(0, type);
      const mostPlayedChampionsArray = [];
      for await (const champion of mostPlayedChampions) {
        const {
          championId,
          championLevel: level,
          championPoints: points,
        } = champion;
        const { name } = await this.getChampionById(championId);
        mostPlayedChampionsArray.push({ name, points, level });
      }

      await RedisClient.set(
        `mostPlayedChampions:${summonerId}_${type}`,
        JSON.stringify(mostPlayedChampionsArray),
        {
          EX: 600,
        },
      );

      return mostPlayedChampionsArray;
    } catch (err: any) {
      if (err?.response) {
        const error = LolApiErrors[err?.response?.status];
        if (error) {
          throw new Error(error);
        }
        log.error(`MostPlayedChampions: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
      log.error(`MostPlayedChampions: ${err?.message!}.`);
      throw new Error('An error occurred while trying to retrieve user data.');
    }
  }

  async getMatchesBySummoner(puuid: string) {
    const get = await RedisClient.get(
      `getMatchesBySummoner:${puuid}_${this.region}`,
    );
    if (get) return JSON.parse(get);

    const url = `${this.matchesURL}/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5&api_key=${RiotToken}`;
    const { data } = await axios.get(url);

    await RedisClient.set(
      `getMatchesBySummoner:${puuid}_${this.region}`,
      JSON.stringify(data),
      {
        EX: 600,
      },
    );

    return data;
  }

  async rankedInfo(summonerId: SummonerBasicData['id']): Promise<RankedInfo> {
    const get = await RedisClient.get(
      `rankedInfo:${summonerId}_${this.region}`,
    );
    if (get) return JSON.parse(get);

    try {
      const urlRanked = `${this.baseURL}/league/v4/entries/by-summoner/${summonerId}?api_key=${RiotToken}`;
      const { data: rankedData } = await axios.get(urlRanked);
      const data: any = {};
      data.solo = [];
      data.flex = [];
      rankedData.forEach((item: any) => {
        if (item.queueType == 'RANKED_SOLO_5x5') {
          const { tier, rank, leaguePoints, wins, losses, queueType } = item;
          data.solo.push({
            tier,
            rank,
            leaguePoints,
            wins,
            losses,
            queueType,
          });
        } else if (item.queueType == 'RANKED_FLEX_SR') {
          const { tier, rank, leaguePoints, wins, losses, queueType } = item;
          data.flex.push({
            tier,
            rank,
            leaguePoints,
            wins,
            losses,
            queueType,
          });
        }
      });
      await RedisClient.set(
        `rankedInfo:${summonerId}_${this.region}`,
        JSON.stringify(data),
        {
          EX: 600,
        },
      );
      return data;
    } catch (err: any) {
      if (err?.response) {
        const error = LolApiErrors[err?.response?.status];
        if (error) {
          throw new Error(error);
        }
        log.error(`RankedInfo: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
      log.error(`RankedInfo: ${err?.message!}.`);
      throw new Error('An error occurred while trying to retrieve user data.');
    }
  }

  async getQueueById(queueId: queueTypes['queueId']): Promise<queueTypes> {
    const get = await RedisClient.get(`getQueueById:${queueId}`);
    if (get) return JSON.parse(get);

    const urlQueues =
      'http://static.developer.riotgames.com/docs/lol/queues.json';
    const { data } = await axios.get(urlQueues);
    const queue = data.filter((q: any) => q.queueId == queueId);

    await RedisClient.set(`getQueueById:${queueId}`, JSON.stringify(queue[0]));
    return queue[0];
  }

  async getCurrentMatch(id: string): Promise<CurrentGameInfo> {
    try {
      const urlCurrentMatch = `${this.baseURL}/spectator/v4/active-games/by-summoner/${id}?api_key=${RiotToken}`;
      const { data: match } = await axios.get(urlCurrentMatch);
      const data: any = [];
      data.userTeam = [];
      data.enemyTeam = [];
      data.gameId = match.gameId;
      data.mapId = match.mapId;
      data.bans = match.bannedChampions;
      data.startTimeGame = match.gameStartTime;
      data.gameMode = match.gameMode;
      data.gameQueueConfigId = match.gameQueueConfigId;
      for (let i = 0; i < match.participants.length; i++) {
        const user = match.participants[i];
        if (user.teamId == 100) {
          const { summonerName, championId, spell1Id, spell2Id } = user;
          const champion = await this.getChampionById(championId);
          data.userTeam.push({
            summonerName,
            championName: champion.name,
            spells: {
              one: String(spell1Id),
              two: String(spell2Id),
            },
          });
        }
        if (user.teamId == 200) {
          const { summonerName, championId, spell1Id, spell2Id } = user;
          const champion = await this.getChampionById(championId);
          data.enemyTeam.push({
            summonerName,
            championName: champion.name,
            spells: {
              one: String(spell1Id),
              two: String(spell2Id),
            },
          });
        }
      }
      return data;
    } catch (err: any) {
      if (err?.response) {
        const error = LolApiErrors[err?.response?.status];
        if (error) {
          throw new Error(error);
        }
        log.error(`GetCurrentMatch: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
      log.error(`GetCurrentMatch: ${err?.message!}.`);
      throw new Error('An error occurred while trying to retrieve user data.');
    }
  }
  async lastPlayedMatch(): Promise<any[]> {
    const get = await RedisClient.get(
      `lastPlayedMatch:${this.username.toLowerCase()}_${this.region}`,
    );
    if (get) return JSON.parse(get);

    try {
      const { puuid } = await this.profileBasicData();
      const url_lastMatch = `${this.matchesURL}/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=${RiotToken}`;

      const { data: lastPlayedMatch } = await axios.get(url_lastMatch);
      const dataArray: any = [];
      const item = lastPlayedMatch[0];

      const data = await this.advencedMatchInfo(item);
      const { participants: participantIdentities } = data.metadata;
      const { gameCreation, gameDuration, gameMode, participants, queueId } =
        data.info;
      const time = [
        `${fabricio(gameDuration * 1000, {
          long: false,
          language: 'en',
          length: 2,
        })}`,
        `<t:${Math.round(gameCreation / 1000)}:R>`,
      ];
      const { map, description: mode } = await this.getQueueById(queueId);
      let currentPlayerId: any = null;
      const currentPlayerSum: any = [];
      participantIdentities.forEach((participant: any, position: any) => {
        if (participant === puuid) {
          currentPlayerId = position + 1;
        }
      });
      participants.forEach((participant: any) => {
        if (participant.participantId === currentPlayerId) {
          currentPlayerSum.push(participant);
        }
      });
      const {
        win,
        kills,
        deaths,
        assists,
        totalMinionsKilled,
        neutralMinionsKilled,
        summoner1Id,
        summoner2Id,
        championId,
      } = currentPlayerSum[0];
      const champ = await this.getChampionById(championId);
      const { role, lane } = currentPlayerSum[0];
      dataArray.push({
        time,
        map,
        mode,
        spells: {
          summoner1Id,
          summoner2Id,
        },
        stats: {
          win,
          kills,
          deaths,
          assists,
          totalMinionsKilled,
          neutralMinionsKilled,
          role,
          lane,
          gameMode,
          champion: { name: champ.name },
        },
      });

      await RedisClient.set(
        `lastPlayedMatch:${this.username.toLowerCase()}_${this.region}`,
        JSON.stringify(dataArray),
        {
          EX: 600,
        },
      );

      return dataArray;
    } catch (e: any) {
      log.error(`LastPlayedMatch: ${e?.message!}.`);
      return null!;
    }
  }

  async getChampions() {
    const patch = await this.getCurrentPatch();
    const get = await RedisClient.get(`championsObject:${patch}`);
    if (get) return JSON.parse(get);

    const { data } = await axios.get(
      `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`,
    );

    await RedisClient.set(
      `championsObject:${patch}`,
      JSON.stringify(data.data),
    );
    return data.data;
  }

  async getChampRotation() {
    const patch = await this.getCurrentPatch();

    const get = await RedisClient.get(`getChampRotation:${patch}`);
    if (get) return JSON.parse(get);

    const response = await axios.get(
      `https://la1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${process.env.RIOT_API_TOKEN}`,
    );

    const freeWeekIds = response.data.freeChampionIds;
    const championsResponse = await this.getChampions();

    const championsInfo = Object.values(championsResponse);
    const getChampionInfo: any = (id: any) => {
      return championsInfo.find((champion: any) => champion.key === String(id));
    };

    const arr: any = [];
    let pos = 0;
    for (const freeId of freeWeekIds) {
      if (!Array.isArray(arr[pos])) arr[pos] = [];
      arr[pos].push(freeId);
    }

    let champions: any;
    for (const ids of arr) {
      champions = ids
        .map((id: any) => ({ id, ...getChampionInfo(id) }))
        .filter((x: any) => !!x.name);
    }

    await RedisClient.set(
      `getChampRotation:${patch}`,
      JSON.stringify(champions),
      { EX: 172800 },
    );

    return champions;
  }
}
