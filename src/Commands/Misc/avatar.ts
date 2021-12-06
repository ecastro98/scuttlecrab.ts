import BaseCommand from '../../Classes/BaseComand';
import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { codestring } from 'detritus-client/lib/utils/markup';
import { fetchGuildMember } from '../../Utils/functions';
import { CommandTypes, EmbedColors } from '../../Utils/constants';
import { Embed } from 'detritus-client/lib/utils';
import { User } from 'detritus-client/lib/structures';

export const commandName = 'avatar';

export default class Avatar extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: commandName,
      aliases: ['av'],
      metadata: {
        description: 'Get the avatar for a user, defaults to self.',
        examples: [commandName, `${commandName} @Scuttle Crab#7877`],
        type: CommandTypes.MISC,
        usage: `${commandName} (user mention)`,
        onlyDevs: false,
        nsfw: false,
        disabled: {
          is: false,
          reason: null,
          severity: null,
          date: 0,
        },
      },
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
      ],
      disableDm: true,
      responseOptional: true,
    });
  }
  async run(ctx: Context) {
    const user = (fetchGuildMember(ctx) as User) || ctx.message.author;

    const embed_success = new Embed()
      .setColor(EmbedColors.DEFAULT)
      .setDescription(`Avatar of ${codestring(user.tag)}.`)
      .setImage(user.avatarUrlFormat(null, { size: 512 }))
      .setFooter(
        `Requested by: ${ctx.user.tag}.`,
        ctx.user.avatarUrlFormat(null, { size: 512 }),
      );
    return await ctx.editOrReply({
      embeds: [embed_success],
    });
  }
}
