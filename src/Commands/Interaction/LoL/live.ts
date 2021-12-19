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
import {
  bold,
  codeblock,
  codestring,
  underline,
} from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { SummonerData } from '../../../Classes/SummonerData';
import {
  ChoicesRegion,
  CommandTypes,
  EmbedColors,
  LolApiErrors,
} from '../../../Utils/constants';
import { ChampionEmojis, Emojis, SpellEmojis } from '../../../Utils/emojis';
import {
  capitalize,
  format,
  getQueueById,
  summonerIcon,
} from '../../../Utils/functions';
import SummonerModel from '../../../Database/src/Models/summoner';

export interface CommandArgs {
  region: string;
  summoner: string;
}

export const commandName = 'live';

export class Live extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description:
        'Live game information: Champions, Spells, Bans, elapsed time, etc.',
      metadata: {
        description:
          'Live game information: Champions, Spells, Bans, Elapsed time, etc.',
        examples: [
          `${commandName} <region: Summoner Region> <summoner: Summoner Name>`,
        ],
        type: CommandTypes.LOL,
        usage: `${commandName} <region: Summoner Region> <summoner: Summoner Name>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'region',
          required: false,
          type: ApplicationCommandOptionTypes.STRING,
          description: 'Summoner region to search.',
          choices: ChoicesRegion,
          default: null,
        },
        {
          name: 'summoner',
          required: false,
          type: ApplicationCommandOptionTypes.STRING,
          description: 'Summoner to search.',
          default: null,
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
    let region = args.region;
    let summoner = args.summoner;

    try {
      if (!region && !summoner) {
        const summonerModel = await SummonerModel.findOne({
          _id: ctx.user.id,
        });

        if (!summonerModel) {
          return ctx.editOrRespond({
            content: `${Emojis.WARNING} You do not yet have an account registered to use the no-argument command.`,
          });
        }

        if (summonerModel) {
          region = summonerModel.region;
          summoner = summonerModel.summoner;
        }
      }

      if (!region) {
        return await ctx.editOrRespond({
          content: `${Emojis.WARNING} Please specify a summoner region.`,
        });
      }

      if (!summoner) {
        return await ctx.editOrRespond({
          content: `${Emojis.WARNING} Please specify a summoner name.`,
        });
      }

      const summoner_data = new SummonerData(region, summoner);

      await ctx.respond({
        type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const basic_data = await summoner_data.profileBasicData();
      const patch = await summoner_data.getCurrentPatch().catch(() => null);
      const live_match = await summoner_data
        .getCurrentMatch(basic_data.id)
        .catch(() => null);

      const icon = summonerIcon(patch as string, basic_data.profileIconId);

      if (!live_match)
        return await ctx.editOrRespond({
          content: `${Emojis.WARNING} ${bold(
            summoner,
          )} is not currently in a live game.`,
        });

      if (live_match) {
        const embed_current_match = new Embed()
          .setTitle(`Scuttle Live Game: ${underline(summoner)}`)
          .setColor(EmbedColors.DEFAULT)
          .setThumbnail(icon);

        const queue = getQueueById(live_match.gameQueueConfigId);
        embed_current_match
          .addField(
            underline('Basic Data'),
            [
              `${capitalize(live_match.gameMode.toLowerCase())}, ${
                queue?.map
              } (${queue?.description}).`,
              `${bold('In game ago:')} ${
                live_match.startTimeGame < 1
                  ? '00:00 elapsed'
                  : format(Date.now() - live_match.startTimeGame).split(
                      ' | ',
                    )[0] + ' elapsed'
              }.`,
            ].join('\n'),
          )
          .addField(underline('Blue Team'), '\u200b', false);
        live_match.userTeam.map((player) =>
          embed_current_match.addField(
            player.summonerName === basic_data.name
              ? underline(player.summonerName)
              : player.summonerName,
            [
              `${codestring('Champion:')} ${
                ChampionEmojis[player.championName]
              }`,
              `${codestring('Spells:')} ${SpellEmojis[player.spells.one]}${
                SpellEmojis[player.spells.two]
              }`,
            ].join('\n'),
            true,
          ),
        );

        embed_current_match.addField(underline('Red Team'), '\u200b', false);
        live_match.enemyTeam.map((player) =>
          embed_current_match.addField(
            player.summonerName === basic_data.name
              ? underline(player.summonerName)
              : player.summonerName,
            [
              `${codestring('Champion:')} ${
                ChampionEmojis[player.championName]
              }`,
              `${codestring('Spells:')} ${SpellEmojis[player.spells.one]}${
                SpellEmojis[player.spells.two]
              }`,
            ].join('\n'),
            true,
          ),
        );

        if (live_match.bans.length > 0) {
          const blue_bans = live_match.bans
            .filter((value) => value.teamId === 100)
            .filter((value) => value.championId !== -1)
            .map(async (value) => {
              const champion = await summoner_data.getChampionById(
                value.championId,
              );
              return champion.name;
            });

          const red_bans = live_match.bans
            .filter((value) => value.teamId === 200)
            .filter((value) => value.championId !== -1)
            .map(async (value) => {
              const champion = await summoner_data.getChampionById(
                value.championId,
              );
              return champion.name;
            });

          const blue = await Promise.all(blue_bans);
          const red = await Promise.all(red_bans);

          const array_values = [
            `${codestring('Blue Team:')} ${
              blue.length > 0 ? blue.join(', ') : 'None'
            }.`,
            `${codestring('Red Team:')} ${
              red.length > 0 ? red.join(', ') : 'None'
            }.`,
          ];

          embed_current_match.addField(
            underline('Bans'),
            array_values.join('\n'),
            false,
          );
        }

        return await ctx.editOrRespond({
          embeds: [embed_current_match],
        });
      }
    } catch (error: any) {
      if (error.message === LolApiErrors[404]) {
        return await ctx.editOrRespond({
          content: `${
            Emojis.WARNING
          } That summoner couldn't be found, at least on that region: ${codestring(
            summoner,
          )} (${codestring(region.toUpperCase())}).`,
        });
      }
      if (
        error.message === LolApiErrors[400] ||
        error.message === LolApiErrors[401]
      ) {
        return await ctx.editOrRespond({
          content: `${Emojis.WARNING} ${error.message}`,
        });
      } else {
        console.error(`Live: ${error.stack}.`);
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
