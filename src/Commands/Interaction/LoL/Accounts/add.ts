import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../../Classes/BaseInteractionCommand';
import { codestring } from 'detritus-client/lib/utils/markup';
import { CommandTypes } from '../../../../Utils/constants';
import { Emojis } from '../../../../Utils/emojis';
import { ChoicesRegion } from '../../../../Utils/constants';
import { SummonerData } from '../../../../Classes/SummonerData';
import SummonerModel from '../../../../Database/src/Models/summoner';

export interface CommandArgs {
  region: string;
  summoner: string;
}

export const commandName = 'add';

export class Add extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Add your League of Legends profile to the Bot.',
      metadata: {
        description: 'Add your League of Legends profile to the Bot.',
        examples: [
          `${commandName} region: LAN summoner: AtomicLotus`,
          `${commandName} region: KR summoner: Hide on Bush`,
        ],
        type: CommandTypes.LOL,
        usage: `${commandName} <region: Summoner Region> <summoner: Summoner Name>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'region',
          required: true,
          type: ApplicationCommandOptionTypes.STRING,
          description: 'Summoner region to save.',
          choices: ChoicesRegion,
        },
        {
          name: 'summoner',
          required: true,
          type: ApplicationCommandOptionTypes.STRING,
          description: 'Summoner to save.',
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
    const { region, summoner } = args;
    const { user } = ctx;

    const summonerData = new SummonerData(region, summoner);
    const basic_data = await summonerData.profileBasicData().catch(() => null);
    if (!basic_data)
      return await ctx.editOrRespond(
        `${Emojis.WARNING} That summoner couldn't be found, at least on that region.`,
      );

    const summonerModel = await SummonerModel.findOne({
      region: region.toLowerCase(),
      summoner: summoner,
    });
    if (summonerModel) {
      if (summonerModel._id === user.id) {
        return await ctx.editOrRespond({
          content: `${Emojis.WARNING} You already have that account linked.`,
        });
      }

      if (summonerModel || summonerModel._id !== user.id) {
        return await ctx.editOrRespond({
          content: `${Emojis.WARNING} That summoner is already linked to another account.`,
        });
      }
    }

    await SummonerModel.create({
      _id: user.id,
      region: region.toLowerCase(),
      summoner: summoner,
    });

    await ctx.editOrRespond({
      content: `${Emojis.CHECK} Added ${codestring(summoner)} to your profile.`,
    });
  }
}
