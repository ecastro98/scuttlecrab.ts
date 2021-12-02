import BaseCommand from '../../Classes/BaseComand';
import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { ComponentActionRow, ComponentButton } from 'detritus-client/lib/utils';

export default class Ping extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: 'links',
      aliases: ['invite', 'support'],
      metadata: {
        description: "Get the latency time of discord's API.",
        examples: ['ping', 'pong', 'latency'],
        category: 'Misc',
        usage: 'ping',
        onlyDevs: false,
        nsfw: false,
      },
      disableDm: false,
      ratelimit: { duration: 3000, limit: 1, type: 'user' },
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
