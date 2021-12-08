import BaseCommand from '../../Classes/BaseComand';
import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { ComponentActionRow, ComponentButton } from 'detritus-client/lib/utils';
import { CommandTypes } from '../../Utils/constants';

export const commandName = 'links';

export default class Ping extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: commandName,
      aliases: ['invite', 'support'],
      metadata: {
        description: 'Get the most important links in the Bot.',
        examples: [commandName],
        type: CommandTypes.MISC,
        usage: commandName,
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
      disableDm: false,
      responseOptional: true,
    });
  }
  async run(ctx: Context) {
    const Buttons = new ComponentActionRow({
      components: [
        new ComponentButton()
          .setStyle(5)
          .setLabel('Invite')
          .setUrl('https://invite.scuttlecrab.ml'),
        new ComponentButton()
          .setStyle(5)
          .setLabel('Support')
          .setUrl('https://discord.gg/pE6efwjXYJ'),
        new ComponentButton()
          .setStyle(5)
          .setLabel('Vote')
          .setUrl('https://top.gg/bot/855554329897336852/vote'),
        new ComponentButton()
          .setStyle(5)
          .setLabel('Website')
          .setUrl('https://scuttlecrab.ml'),
      ],
    });

    return await ctx.editOrReply({
      content: 'These are my most important links.',
      components: [Buttons],
    });
  }
}
