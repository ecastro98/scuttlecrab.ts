import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { SummonerData } from '../../../Classes/SummonerData';
import { CommandTypes, EmbedColors } from '../../../Utils/constants';
import { Emojis } from '../../../Utils/emojis';
import { bold, codestring, underline } from 'detritus-client/lib/utils/markup';
import {
  ApplicationCommandOptionTypes,
  InteractionCallbackTypes,
} from 'detritus-client/lib/constants';
import { Champions } from '../../../Utils/champions';
import { Embed } from 'detritus-client/lib/utils';
import { capitalize, getBuildsAndRunes } from '../../../Utils/functions';

export interface CommandArgs {
  champion: string;
  role: string;
}

export const commandName = 'build';

export class Build extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Recommended build for a champion.',
      metadata: {
        description: 'Recommended build for a champion.',
        examples: [
          `${commandName} Vi`,
          `${commandName} Caitlyn`,
          `${commandName} Jinx`, //fuck you x2
        ],
        type: CommandTypes.LOL,
        usage: `${commandName} <champion: Champion Name>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'champion',
          type: ApplicationCommandOptionTypes.STRING,
          required: true,
          description: 'The champion name.',
          async onAutoComplete(ctx) {
            const choices: Array<{ name: string; value: string }> = [];
            const results = Champions.filter((champion) =>
              champion.name.toLowerCase().includes(ctx.value.toLowerCase()),
            );
            if (results)
              choices.push(
                ...results.map((res) => {
                  return {
                    name: res.name,
                    value: res.value,
                  };
                }),
              );
            return await ctx.respond({ choices: choices });
          },
        },
        {
          name: 'role',
          type: ApplicationCommandOptionTypes.STRING,
          required: false,
          description: 'The role of the champion.',
          default: '',
          choices: [
            {
              name: 'Top',
              value: 'top',
            },
            {
              name: 'Jungle',
              value: 'jungle',
            },
            {
              name: 'Mid',
              value: 'middle',
            },
            {
              name: 'ADC',
              value: 'adc',
            },
            {
              name: 'Support',
              value: 'support',
            },
          ],
        },
      ],
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
      ],
      disableDm: false,
    });
  }

  async run(ctx: InteractionContext, { champion, role }: CommandArgs) {
    await ctx.respond({
      type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    const basic_data = new SummonerData('lan', 'NoSoySimpDeVi');
    const patch = await basic_data.getCurrentPatch();
    const champion_data = await basic_data
      .getChampionById(Number(champion))
      .catch(() => null);

    if (!champion_data) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} Unknown champion.`,
      });
    }

    if (champion_data) {
      const build = await getBuildsAndRunes(
        champion_data.id as unknown as string,
        role,
      ).catch(() => null);

      if (!build) {
        return await ctx.editOrRespond({
          content: `${Emojis.WARNING} No builds found for this champion.`,
        });
      }

      const embed_build = new Embed()
        .setTitle(
          underline(
            `${champion_data.name} ${
              role !== '' ? `${capitalize(role)} ` : ''
            }Build`,
          ),
        )
        .setThumbnail(
          `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champion_data.image.full}`,
        )
        .setColor(EmbedColors.DEFAULT)
        .addField(
          underline('Primary Runes'),
          build!
            .map((x) =>
              x.runesPrimary
                .map((value, i) => `${codestring(`${++i}.`)} ${value}.`)
                .join('\n'),
            )
            .join('\n'),
          true,
        )
        .addField(
          underline('Secondary Runes'),
          build!
            .map((x) =>
              x.runesSecondary
                .map((value, i) => `${codestring(`${++i}.`)} ${value}.`)
                .join('\n'),
            )
            .join('\n'),
          true,
        )
        .addField(
          underline('Shard Runes'),
          build!
            .map((x) =>
              x.runesShard
                .map((value, i) => `${codestring(`${++i}.`)} ${value}.`)
                .join('\n'),
            )
            .join('\n'),
          true,
        )
        .addField(
          underline('Recommended Items'),
          build!
            .map((x) =>
              x.items
                .map((value, i) => `${codestring(`${++i}.`)} ${value}.`)
                .join('\n'),
            )
            .join('\n'),
          true,
        )
        .addField(
          underline('Recommended Spells'),
          build!
            .map((x) =>
              x.spells
                .map((value, i) => `${codestring(`${++i}.`)} ${value}.`)
                .join('\n'),
            )
            .join('\n'),
          true,
        );

      return await ctx.editOrRespond({
        embeds: [embed_build],
      });
    }
  }
}
