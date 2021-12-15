import {
  ApplicationCommandOptionTypes,
  InteractionCallbackTypes,
} from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import {
  ComponentActionRow,
  ComponentButton,
  Embed,
} from 'detritus-client/lib/utils';
import { bold, codeblock, underline } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import {
  CommandTypes,
  ChoicesRegion,
  EmbedColors,
  makeUrl,
  OPRegions,
  URegions,
  LolApiErrors,
} from '../../../Utils/constants';
import { SummonerData } from '../../../Classes/SummonerData';
import {
  ChampionEmojis,
  Emojis,
  RankedEmojis,
  SpellEmojis,
} from '../../../Utils/emojis';
import { summonerIcon } from '../../../Utils/functions';
import { mostPlayed } from '../../../Utils/types';

export interface CommandArgs {
  region: string;
  summoner: string;
}

export const commandName = 'profile';

export class Profile extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description:
        'Profile of a summoner with rankings, champions, last game, etc.',
      metadata: {
        description:
          'Profile of a summoner with rankings, champions, last game, etc.',
        examples: [
          `${commandName} LAN AtomicLotus`,
          `${commandName} KR Hide on Bush`,
        ],
        type: CommandTypes.LOL,
        usage: `${commandName} <region> <username>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'region',
          required: true,
          type: ApplicationCommandOptionTypes.STRING,
          description: 'Summoner region to search.',
          choices: ChoicesRegion,
        },
        {
          name: 'summoner',
          required: true,
          type: ApplicationCommandOptionTypes.STRING,
          description: 'Summoner to search.',
        },
      ],
      ratelimits: [
        { duration: 6500, limit: 1, type: 'user' },
        { duration: 9500, limit: 3, type: 'channel' },
        { duration: 20000, limit: 5, type: 'guild' },
      ],
      disableDm: false,
    });
  }

  async run(ctx: InteractionContext, args: CommandArgs) {
    try {
      const region = args.region;
      const summoner = args.summoner;
      const embeds: Array<Embed> = [];

      const summoner_data = new SummonerData(region, summoner);

      await ctx.respond({
        type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const basic_data = await summoner_data.profileBasicData();
      const patch = await summoner_data.getCurrentPatch().catch(() => null);
      const lastMatch = await summoner_data.lastPlayedMatch().catch(() => null);
      const rankedInfo = await summoner_data
        .rankedInfo(basic_data.id)
        .catch(() => null);

      const most_played_champions = await summoner_data.mostPlayedChampions(
        basic_data.id,
        mostPlayed.DEFAULT,
      );

      const icon = summonerIcon(patch as string, basic_data.profileIconId);

      const embed_main = new Embed()
        .setColor(EmbedColors.DEFAULT)
        .setTitle(`Scuttle Profile: ${underline(basic_data.name)}`)
        .setThumbnail(icon)
        .setFooter(
          `Requested by: ${ctx.user.tag}.`,
          ctx.user.avatarUrlFormat(null, { size: 128 }),
        )
        .addField(
          underline('Basic Data'),
          [
            `${bold('Level:')} ${basic_data.summonerLevel}.`,
            `${bold('Region:')} ${
              region === 'oc' ? 'OCE' : region.toUpperCase()
            }.`,
            `${bold('Icon URL:')} [Click here](${icon}).`,
          ].join('\n'),
          true,
        )
        .addField(
          underline('Best Champions'),
          most_played_champions.length > 0
            ? most_played_champions
                .map((champ) => {
                  return `${ChampionEmojis[champ.name]} ${bold(
                    `[${champ.level}] ${champ.name}:`,
                  )} ${Number(champ.points).toLocaleString()} points.`;
                })
                .join('\n')
            : 'No information found.',
          true,
        );
      if (lastMatch?.length) {
        const { time, mode, map, spells, stats } = lastMatch[0];
        const {
          win,
          kills,
          deaths,
          assists,
          totalMinionsKilled,
          neutralMinionsKilled,
        } = stats;
        const champion = stats.champion;

        embed_main.addField(
          underline('Last Match'),
          [
            `${map} (${mode}) (${time[0]}).`,
            `${bold('Champion:')} ${ChampionEmojis[`${champion.name}`]} ${
              champion.name
            } (${win ? 'Win' : 'Defeat'}).`,
            `${bold('KDA:')} ${
              deaths == 0 && kills > 1 ? 'Perfect' : 'Imperfect'
            } (${kills}/${deaths}/${assists}).`,
            `${bold('CS:')} ${totalMinionsKilled + neutralMinionsKilled}.`,
            `${bold('Spells:')} ${SpellEmojis[spells.summoner1Id]}${
              SpellEmojis[spells.summoner2Id]
            }.`,
            `${bold('Date:')} ${time[1]}.`,
          ].join('\n'),
        );
      }
      embed_main.addField(
        underline('Last Matches'),
        'No information obtained.',
      );

      if (rankedInfo) {
        const { solo, flex } = rankedInfo!;

        if (solo?.length) {
          const tierName_solo = solo![0]?.tier
            .split(' ')
            .map((x) => x[0]?.toUpperCase() + x.slice(1)?.toLowerCase())
            .join(' ');

          if (solo?.length) {
            embed_main.addField(
              underline('Ranked Solo/Duo'),
              solo
                ? [
                    // :)
                    `${
                      RankedEmojis[tierName_solo as keyof typeof RankedEmojis]
                    } ${tierName_solo!} ${solo[0].rank}.`,
                    `${bold('LP:')} ${solo[0].leaguePoints}.`,
                    `${bold('Wins:')} ${solo[0].wins}.`,
                    `${bold('Losses:')} ${solo[0].losses}.`,
                    `${bold('Winrate:')} ${
                      (
                        (solo[0].wins * 100) /
                        (solo[0].wins + solo[0].losses)
                      ).toFixed(1) || 0
                    }%.`,
                  ].join('\n')
                : 'No stats in this game mode.',
              true,
            );
          }
        }

        if (flex?.length) {
          const tierName_flex = flex![0].tier
            .split(' ')
            .map((x) => x[0]?.toUpperCase() + x.slice(1)?.toLowerCase())
            .join(' ');

          embed_main.addField(
            underline('Ranked Flex'),
            solo
              ? [
                  `${
                    RankedEmojis[tierName_flex as keyof typeof RankedEmojis]
                  } ${tierName_flex} ${flex[0].rank}.`,
                  `${bold('LP:')} ${flex[0].leaguePoints}.`,
                  `${bold('Wins:')} ${flex[0].wins}.`,
                  `${bold('Losses:')} ${flex[0].losses}.`,
                  `${bold('Winrate:')} ${
                    (
                      (flex[0].wins * 100) /
                      (flex[0].wins + flex[0].losses)
                    ).toFixed(1) || 0
                  }%.`,
                ].join('\n')
              : 'No stats in this game mode.',
            true,
          );
        }
      }

      embeds.push(embed_main);

      return await ctx.editOrRespond({
        content: `View on [OP.GG](${makeUrl.opgg(
          OPRegions[region],
          encodeURIComponent(summoner),
        )}) or [U.GG](${makeUrl.ugg(
          URegions[region],
          encodeURIComponent(summoner),
        )}).`,
        embeds: embeds,
      });
    } catch (error: any) {
      if (
        error.message === LolApiErrors[400] ||
        error.message === LolApiErrors[401] ||
        error.message === LolApiErrors[404]
      ) {
        return await ctx.editOrRespond({
          content: `${Emojis.warning} ${error.message}`,
        });
      } else {
        console.log(`Profile: ${error.stack}.`);
        const embed = new Embed()
          .setTitle('Command Error')
          .setColor(EmbedColors.ERROR)
          .setDescription(codeblock(String(error), { language: 'js' }))
          .setFooter('Report it on the support server.');

        const button = new ComponentActionRow({
          components: [
            new ComponentButton()
              .setStyle(5)
              .setLabel('Support')
              .setUrl('https://discord.gg/pE6efwjXYJ'),
          ],
        });

        return await ctx.editOrRespond({
          embeds: [embed],
          components: [button],
        });
      }
    }
  }
}
