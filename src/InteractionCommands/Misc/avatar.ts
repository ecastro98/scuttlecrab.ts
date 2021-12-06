import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { Member, User } from 'detritus-client/lib/structures';
import { Embed } from 'detritus-client/lib/utils';
import { codestring } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommand } from '../../Classes/BaseInteractionCommand';
import { CommandTypes, EmbedColors } from '../../Utils/constants';

export interface CommandArgs {
  user: Member | User;
}

export const commandName = 'avatar';

export default class Avatar extends BaseInteractionCommand {
  constructor() {
    super({
      name: commandName,
      description: 'Get the avatar of a user.',
      metadata: {
        description: 'Get the avatar of a user.',
        examples: [commandName],
        type: CommandTypes.MISC,
        usage: commandName,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'user',
          description: 'The user to get the avatar of.',
          default: (ctx: InteractionContext) => ctx.member || ctx.user,
          type: ApplicationCommandOptionTypes.USER,
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
    const embed_success = new Embed()
      .setColor(EmbedColors.DEFAULT)
      .setDescription(`Avatar of ${codestring(args.user.tag)}.`)
      .setImage(args.user.avatarUrlFormat(null, { size: 512 }))
      .setFooter(
        `Requested by: ${ctx.user.tag}.`,
        ctx.user.avatarUrlFormat(null, { size: 512 }),
      );
    return await ctx.editOrRespond({
      embeds: [embed_success],
    });
  }
}
