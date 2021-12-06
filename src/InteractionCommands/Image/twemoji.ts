import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommand } from '../../Classes/BaseInteractionCommand';
import { CommandTypes } from '../../Utils/constants';
import { Emojis } from '../../Utils/emojis';
import { parse } from 'twemoji-parser';
import svg2img from 'svg2img';

export interface CommandArgs {
  emoji: string;
  width: number;
  height: number;
}

export const commandName = 'twemoji';

export default class TwEmoji extends BaseInteractionCommand {
  constructor() {
    super({
      name: commandName,
      description: 'Enlarge a default Discord emoji.',
      metadata: {
        description: 'Enlarge a default Discord emoji.',
        examples: [`${commandName} 🤖`, `${commandName} ✨ 1024`],
        type: CommandTypes.IMG,
        usage: `${commandName} <emoji> (size)`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'emoji',
          description: 'The emoji you want to enlarge.',
          type: ApplicationCommandOptionTypes.STRING,
          required: true,
        },
        {
          name: 'width',
          description: 'Image width.',
          type: 10,
          default: 512,
          required: false,
        },
        {
          name: 'height',
          description: 'Image height.',
          type: 10,
          default: 512,
          required: false,
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

  async run(ctx: InteractionContext, args: CommandArgs) {
    const regExp =
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;

    if (!regExp.test(args.emoji)) {
      return await ctx.editOrRespond({
        content: `${Emojis.warning} The entered emoji is not Discord's own, it is a customized one.`,
      });
    }

    const options_emoji_url = parse(args.emoji, { assetType: 'svg' })[0].url;
    const options_size_width =
      args.width && args.width <= 1024 && args.width > 0 ? args.width : 512;

    const options_size_height =
      args.height && args.height <= 1024 && args.height > 0 ? args.height : 512;

    svg2img(
      options_emoji_url,
      {
        width: options_size_width,
        height: options_size_height,
        //@ts-ignore
        format: 'png',
      },
      async function (error, buffer) {
        return await ctx.editOrRespond({
          files: [
            {
              value: buffer,
              filename: 'emoji.png',
            },
          ],
        });
      },
    );
  }
}
