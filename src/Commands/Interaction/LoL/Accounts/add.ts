import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../../Classes/BaseInteractionCommand';
import { bold, codestring, italics } from 'detritus-client/lib/utils/markup';
import { CommandTypes } from '../../../../Utils/constants';
import { Emojis } from '../../../../Utils/emojis';
import { ChoicesRegion } from '../../../../Utils/constants';
import { SummonerData } from '../../../../Classes/SummonerData';
import { uuidv4 } from '../../../../Utils/functions';
import { Message } from 'detritus-client/lib/structures';
import SummonerModel from '../../../../Database/src/Models/summoner';
import MessageCollector from '../../../../Collectors/messagecollector';
import axios from 'axios';

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

  async run(ctx: InteractionContext, { region, summoner }: CommandArgs) {
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

    const code = uuidv4();

    await ctx.editOrRespond({
      content: `${Emojis.LOADING} ${bold(
        ctx.user.username,
      )}, Now go to the settings of your ${bold(
        'League of Legends client',
      )}, where you should look for the ${bold(
        'verification',
      )} tab.\nOnce there, enter the following code in the window and click ${bold(
        'save',
      )}.\n${bold('Code:')} ${codestring(
        code,
      )}.\nWhen you have entered the code type ${bold(
        'ready',
      )} in this channel.\n${italics(
        'You only have 1 try to say the word `ready` (60 seconds)',
      )}.`,
      files: [
        {
          value: await ctx.rest.get(
            'https://cdn.discordapp.com/attachments/915654347394777161/921816510643724298/example_verify_account.png',
          ),
          filename: 'example_verify_account.png',
        },
      ],
    });

    const filter = (m: Message) => m.author.id == ctx.user.id;
    const collector = new MessageCollector(
      ctx.channel!,
      { filter: filter, timeLimit: 50000, max: 1 },
      ctx.client,
    );

    collector.on('collect', async (message: Message) => {
      if (message.content.toLowerCase() === 'ready') {
        await message.channel?.createMessage({
          content: `${Emojis.LOADING} Verifying that everything is correct...`,
        });

        const verify = await axios
          .get(
            `${summonerData.baseURL}/platform/v4/third-party-code/by-summoner/${basic_data.id}?api_key=${process.env.RIOT_API_TOKEN}`,
          )
          .catch(() => null);

        if (!verify) {
          return await message.channel?.createMessage({
            content: `${Emojis.WARNING} Your account could not be verified, make sure you have entered the code correctly.`,
          });
        }

        if (String(verify.data) === code) {
          await message.channel?.createMessage({
            content: `${Emojis.TADA} Your account has been verified ${bold(
              summoner,
            )} (${codestring(region.toUpperCase())}).`,
          });

          await SummonerModel.create({
            _id: user.id,
            region: region.toLowerCase(),
            summoner: summoner,
          });
        } else {
          return await message.channel?.createMessage({
            content: `${Emojis.WARNING} Your account could not be verified, make sure you have entered the code correctly.`,
          });
        }
      }
    });

    collector.on('end', async (end_type) => {
      if (end_type === 'time') {
        await ctx.editOrRespond({
          content: `${Emojis.WARNING} You didn't respond in time.`,
        });
      }
    });
  }
}
