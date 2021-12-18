import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { SummonerData } from '../../../Classes/SummonerData';
import { CommandTypes, EmbedColors } from '../../../Utils/constants';
import { Emojis } from '../../../Utils/emojis';
import { bold, underline } from 'detritus-client/lib/utils/markup';
import {
  ApplicationCommandOptionTypes,
  InteractionCallbackTypes,
  MessageComponentButtonStyles,
} from 'detritus-client/lib/constants';
import {
  ComponentActionRow,
  ComponentButton,
  Embed,
} from 'detritus-client/lib/utils';
import ButtonCollector, {
  INTERACTION,
} from '../../../Collectors/buttoncollector';
import { Champions } from '../../../Utils/champions';

export interface CommandArgs {
  champion: string;
}

export const commandName = 'champion';

export class Champion extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Information about the champion.',
      metadata: {
        description: 'Information about the champion.',
        examples: [
          `${commandName} Vi`,
          `${commandName} Caitlyn`,
          `${commandName} Jinx`, //fuck you
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
      ],
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
      ],
      disableDm: false,
    });
  }

  async run(ctx: InteractionContext, { champion }: CommandArgs) {
    await ctx.respond({
      type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    const basic_data = new SummonerData('lan', 'NoSoySimpDeVi');
    const patch = await basic_data.getCurrentPatch();
    const champion_data = await basic_data
      .getChampionById(Number(champion))
      .catch(() => null);

    if (!champion_data)
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} I couldn't find that champion.`,
      });

    if (champion_data.lore.length > 4096)
      champion_data.lore = `${champion_data.lore.substr(0, 4090)}...`;

    const embed = new Embed()
      .setTitle(underline(`${champion_data.name}, ${champion_data.title}`))
      .setThumbnail(
        `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champion_data.image.full}`,
      )
      .setDescription(champion_data.lore)
      .setColor(EmbedColors.DEFAULT);
    embed.addField(
      underline('Tags'),
      champion_data.tags.map((x: any) => x).join(', ') + '.',
    );

    const allytips_btn = new ComponentButton()
      .setStyle(MessageComponentButtonStyles.SUCCESS)
      .setLabel('Ally Tips')
      .setCustomId('allytips_btn')
      .setDisabled(!(champion_data.allytips.length > 0));

    const enemytips_btn = new ComponentButton()
      .setStyle(MessageComponentButtonStyles.DANGER)
      .setLabel('Enemy Tips')
      .setCustomId('enemytips_btn')
      .setDisabled(!(champion_data.enemytips.length > 0));

    const skins_btn = new ComponentButton()
      .setStyle(MessageComponentButtonStyles.PRIMARY)
      .setLabel('Skins')
      .setCustomId('skins_btn');

    await ctx.editOrRespond({
      embeds: [embed],
      components: [
        new ComponentActionRow({
          components: [allytips_btn, enemytips_btn, skins_btn],
        }),
      ],
    });

    const filter = (m: INTERACTION) => m.userId == ctx.user.id;
    const msg = await ctx.fetchResponse();
    const collector = new ButtonCollector(
      msg,
      { filter: filter, timeIdle: 60 * 1000, timeLimit: 1 * 60 * 1000 },
      ctx.client,
    );

    collector.on('collect', async (interaction) => {
      switch (interaction.data.customId) {
        case 'allytips_btn':
          const allytips_embed = new Embed()
            .setTitle(underline('Ally Tips'))
            .setThumbnail(
              `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champion_data.image.full}`,
            )
            .setDescription(
              champion_data.allytips
                .map((x, i) => `${bold(++i + '.')} ${x}`)
                .join('\n') || 'No ally tips.',
            )
            .setColor(EmbedColors.DEFAULT);

          await interaction.respond({
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [allytips_embed],
            },
          });
          allytips_btn.setDisabled(true);
          await msg.edit({
            embeds: [embed],
            components: [
              new ComponentActionRow({
                components: [allytips_btn, enemytips_btn, skins_btn],
              }),
            ],
          });
          break;

        case 'enemytips_btn':
          const enemytips_embed = new Embed()
            .setTitle(underline('Enemy Tips'))
            .setThumbnail(
              `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champion_data.image.full}`,
            )
            .setDescription(
              champion_data.enemytips
                .map((x, i) => `${bold(++i + '.')} ${x}`)
                .join('\n') || 'No enemy tips.',
            )
            .setColor(EmbedColors.DEFAULT);

          await interaction.respond({
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [enemytips_embed],
            },
          });
          enemytips_btn.setDisabled(true);
          await msg.edit({
            embeds: [embed],
            components: [
              new ComponentActionRow({
                components: [allytips_btn, enemytips_btn, skins_btn],
              }),
            ],
          });
          break;

        case 'skins_btn':
          const skins_embed = new Embed()
            .setTitle(underline('Skins'))
            .setThumbnail(
              `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champion_data.image.full}`,
            )
            .setDescription(
              champion_data.skins
                .map(
                  (x: any, i) =>
                    `${bold(`${++i}.`)} [${
                      x.name
                    }](https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${
                      champion_data.id
                    }_${x.num}.jpg)`,
                )
                .join('\n') || 'No skins.',
            )
            .setColor(EmbedColors.DEFAULT);

          await interaction.respond({
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [skins_embed],
            },
          });

          skins_btn.setDisabled(true);
          await msg.edit({
            embeds: [embed],
            components: [
              new ComponentActionRow({
                components: [allytips_btn, enemytips_btn, skins_btn],
              }),
            ],
          });
          break;
      }
    });

    collector.on('end', async () => {
      allytips_btn.setDisabled(true);
      enemytips_btn.setDisabled(true);
      skins_btn.setDisabled(true);
      await msg.edit({
        embeds: [embed],
        components: [
          new ComponentActionRow({
            components: [allytips_btn, enemytips_btn, skins_btn],
          }),
        ],
      });
    });
  }
}
