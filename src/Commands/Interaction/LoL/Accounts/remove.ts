import { MessageComponentButtonStyles } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../../Classes/BaseInteractionCommand';
import { codestring } from 'detritus-client/lib/utils/markup';
import { CommandTypes } from '../../../../Utils/constants';
import { Emojis } from '../../../../Utils/emojis';
import { ComponentActionRow, ComponentButton } from 'detritus-client/lib/utils';
import SummonerModel from '../../../../Database/src/Models/summoner';
import ButtonCollector, {
  INTERACTION,
} from '../../../../Collectors/buttoncollector';

export const commandName = 'remove';

export class Remove extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Remove your League of Legends profile to the Bot.',
      metadata: {
        description: 'Remove your League of Legends profile to the Bot.',
        examples: [commandName],
        type: CommandTypes.LOL,
        usage: commandName,
        onlyDevs: false,
        nsfw: false,
      },
      ratelimits: [
        { duration: 6500, limit: 1, type: 'user' },
        { duration: 9500, limit: 3, type: 'channel' },
        { duration: 20000, limit: 5, type: 'guild' },
      ],
      disableDm: false,
    });
  }

  async run(ctx: InteractionContext) {
    const { user } = ctx;

    const summonerModel = await SummonerModel.findOne({
      _id: user.id,
    });

    if (!summonerModel) {
      return await ctx.editOrRespond(
        `${Emojis.WARNING} You don't have a League of Legends profile registered in the Bot.`,
      );
    }

    const yes_btn = new ComponentButton()
      .setStyle(MessageComponentButtonStyles.DANGER)
      .setLabel('Yes')
      .setCustomId('yes_btn');

    const no_btn = new ComponentButton()
      .setStyle(MessageComponentButtonStyles.PRIMARY)
      .setLabel('No')
      .setCustomId('no_btn');

    await ctx.editOrRespond({
      content: `${Emojis.END} Are you sure you want to delete your profile? ${
        summonerModel.summoner
      } (${codestring(summonerModel.region.toUpperCase())}).`,
      components: [
        new ComponentActionRow({
          components: [yes_btn, no_btn],
        }),
      ],
    });

    const msg = await ctx.fetchResponse();
    const filter = (m: INTERACTION) => m.userId == ctx.user.id;

    const collector = new ButtonCollector(
      msg,
      { filter: filter, timeIdle: 60 * 1000, timeLimit: 1 * 60 * 1000, max: 1 },
      ctx.client,
    );

    collector.on('collect', async (interaction) => {
      switch (interaction.data.customId) {
        case 'yes_btn': {
          await ctx.editOrRespond(`${Emojis.LOADING} Removing your profile...`);
          await SummonerModel.deleteOne({
            _id: user.id,
          });
          await ctx.editOrRespond(
            `${Emojis.CHECK} Your profile was successfully deleted.`,
          );
          break;
        }

        case 'no_btn':
          await ctx.editOrRespond(
            `${Emojis.CHECK} The operation has been cancelled.`,
          );
          break;
      }
    });
  }
}
