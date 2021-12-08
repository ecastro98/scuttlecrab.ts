import axios from 'axios';
import fabricio from '@fabricio-191/ms';
import { LolRegions, twoLolRegions } from '../Utils/constants';
import {
  ObjectChampion,
  SummonerBasicData,
  mostPlayed,
  mostPlayedChampion,
  rankedData,
  queueTypes,
} from '../Utils/types';
import { Logger } from '@dimensional-fun/logger';
const log = new Logger('🎮', {
  defaults: { timestamp: false },
});

const RiotToken = process.env.RIOT_API_TOKEN;

export class SummonerData {
  baseURL: string;
  username: string;
  currentPatch!: string;
  matchesURL: string;
  constructor(region: string, username: string) {
    this.baseURL = `https://${SummonerData.Region(
      region,
    )}.api.riotgames.com/lol`;
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
    try {
      const url = `${
        this.baseURL
      }/summoner/v4/summoners/by-name/${encodeURIComponent(
        this.username,
      )}?api_key=${RiotToken}`;
      const { data: basicData } = await axios.get(url);
      return basicData;
    } catch (err: any) {
      if (err?.response?.status! == 401) {
        throw new Error(
          'The information could not be obtained as the "Development API Key" provided by Riot Games has expired.',
        );
      }
      if (err?.response?.status! == 404) {
        throw new Error('This user does not exist in the current region.');
      }
      if (err?.response?.status! == 400) {
        throw new Error(
          'It has not been possible to obtain the information because the request or request was incorrect.',
        );
      } else {
        log.error(`ProfileBasicData: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
    }
  }

  async profileBasicDataBySummonerId(
    summonerId: SummonerBasicData['id'],
  ): Promise<SummonerBasicData | Error> {
    try {
      const url = `${this.baseURL}/summoner/v4/summoners/${summonerId}?api_key=${RiotToken}`;
      const { data: basicData } = await axios.get(url);
      return basicData;
    } catch (err: any) {
      if (err?.response?.status! == 401) {
        throw new Error(
          'The information could not be obtained as the "Development API Key" provided by Riot Games has expired.',
        );
      }
      if (err?.response?.status! == 404) {
        throw new Error('This user does not exist in the current region.');
      }
      if (err?.response?.status! == 400) {
        throw new Error(
          'It has not been possible to obtain the information because the request or request was incorrect.',
        );
      } else {
        log.error(`ProfileBasicDataBySummonerId: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
    }
  }

  async getCurrentPatch(): Promise<string> {
    if (this.currentPatch) return this.currentPatch;
    const url = `https://ddragon.leagueoflegends.com/api/versions.json`;
    const { data } = await axios.get(url);
    this.currentPatch = data[0];
    return data[0];
  }

  async getChampionById(id: ObjectChampion['id']): Promise<ObjectChampion> {
    const patch = await this.getCurrentPatch();
    const url = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`;
    const { data: response } = await axios.get(url);
    var champId: any;
    const champions = Object.keys(response.data);
    champions.forEach((champ) => {
      if (response.data[champ].key == id) {
        champId = response.data[champ].id;
      }
    });

    const url_2 = `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${champId}.json`;
    const { data: response_2 } = await axios.get(url_2);
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
    /*
        This is purely for writing the code.
        I recommend caching the full current patch, so you don't eat a bit of Riot API.
      */
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
      return mostPlayedChampionsArray;
    } catch (err: any) {
      if (err?.response?.status! == 401) {
        throw new Error(
          'The information could not be obtained as the "Development API Key" provided by Riot Games has expired.',
        );
      }
      if (err?.response?.status! == 404) {
        throw new Error('This user does not exist in the current region.');
      }
      if (err?.response?.status! == 400) {
        throw new Error(
          'It has not been possible to obtain the information because the request or request was incorrect.',
        );
      } else {
        log.error(`MostPlayedChampions: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
    }
  }

  async getMatchesBySummoner(puuid: string) {
    const url = `${this.matchesURL}/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5&api_key=${RiotToken}`;
    const { data } = await axios.get(url);
    return data;
  }

  async rankedInfo(summonerId: SummonerBasicData['id']): Promise<rankedInfo> {
    try {
      const urlRanked = `${this.baseURL}/league/v4/entries/by-summoner/${summonerId}?api_key=${RiotToken}`;
      const { data: rankedData } = await axios.get(urlRanked);
      const data: any = [];
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
      return data!;
    } catch (err: any) {
      if (err?.response?.status! == 401) {
        throw new Error(
          'The information could not be obtained as the "Development API Key" provided by Riot Games has expired.',
        );
      }
      if (err?.response?.status! == 404) {
        throw new Error('This user does not exist in the current region.');
      }
      if (err?.response?.status! == 400) {
        throw new Error(
          'It has not been possible to obtain the information because the request or request was incorrect.',
        );
      } else {
        log.error(`RankedInfo: ${err?.stack!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
    }
  }

  async getQueueById(queueId: queueTypes['queueId']): Promise<queueTypes> {
    const urlQueues =
      'http://static.developer.riotgames.com/docs/lol/queues.json';
    const { data } = await axios.get(urlQueues);
    const queue = data.filter((q: any) => q.queueId == queueId);
    return queue[0];
  }

  async getCurrentMatch(id: string) {
    try {
      const urlCurrentMatch = `${this.baseURL}/spectator/v4/active-games/by-summoner/${id}?api_key=${RiotToken}`;
      const { data: match } = await axios.get(urlCurrentMatch);
      let data: any;
      Object.assign(data, {
        userTeam: [],
        enemyTeam: [],
        gameId: match.gameId,
        mapId: match.mapId,
        bans: match.bannedChampions,
        startTimeGame: match.gameStartTime,
        mode: match.gameMode,
        gameQueueConfigId: match.gameQueueConfigId,
      });
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
            bans: match.bannedChampions.filter((x: any) => x.teamId == 100),
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
            bans: match.bannedChampions.filter((x: any) => x.teamId == 200),
          });
        }
      }
      return data;
    } catch (err: any) {
      if (err?.response?.status! == 401) {
        throw new Error(
          'The information could not be obtained as the "Development API Key" provided by Riot Games has expired.',
        );
      }
      if (err?.response?.status! == 404) {
        throw new Error('This user does not exist in the current region.');
      }
      if (err?.response?.status! == 400) {
        throw new Error(
          'It has not been possible to obtain the information because the request or request was incorrect.',
        );
      } else {
        log.error(`GetCurrentMatch: ${err?.message!}.`);
        throw new Error(
          'An error occurred while trying to retrieve user data.',
        );
      }
    }
  }
  async lastPlayedMatch(): Promise<any[]> {
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
      return dataArray;
    } catch (e: any) {
      log.error(`LastPlayedMatch: ${e?.message!}.`);
      return null!;
    }
  }
}

export type rankedInfo = {
  solo?: rankedData[];
  flex?: rankedData[];
};
