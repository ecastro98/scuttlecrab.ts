import BaseCommand from '../../Classes/BaseComand';
import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { codestring } from 'detritus-client/lib/utils/markup';
import axios from 'axios';

export default class Ping extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: 'avatar',
      aliases: ['av'],
      metadata: {
        description: 'Get the avatar for a user, defaults to self.',
        examples: ['avatar', 'avatar @Scuttle Crab#7877'],
        category: 'Misc',
        usage: 'avatar (user mention)',
        onlyDevs: false,
        nsfw: false,
      },
      ratelimit: { duration: 4000, limit: 1, type: 'user' },
      disableDm: true,
      responseOptional: true,
    });
  }
  async run(ctx: Context) {
    //@ts-ignore
    const user = ctx.message.mentions.first()?.user || ctx.user;

    // const buffer = Buffer.from(
    //   user.avatar
    //     ? user.avatarUrlFormat(null, { size: 512 })
    //     : user.defaultAvatarUrl,
    // );

    let url = user.avatar
      ? user.avatarUrlFormat(null, { size: 512 })
      : user.defaultAvatarUrl;

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'utf-8');

    return await ctx.editOrReply({
      content: `Avatar of ${codestring(user.tag)}.`,
      files: [
        {
          value: buffer,
          filename: `avatar.gif`,
        },
      ],
    });
  }
}
