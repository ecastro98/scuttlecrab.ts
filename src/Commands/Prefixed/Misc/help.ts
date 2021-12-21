import BaseCommand from '../../../Classes/BaseComand';
import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { ComponentActionRow, ComponentButton } from 'detritus-client/lib/utils';
import { CommandTypes } from '../../../Utils/constants';
import { bold, codestring } from 'detritus-client/lib/utils/markup';

export const commandName = 'help';

export default class Help extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: commandName,
      aliases: ['help', 'commands'],
      metadata: {
        description: 'Get the help about the bot.',
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
      ],
    });

    const Content = [
      `${bold(ctx.client!.user!.tag)} is a League of Legends Discord bot.`,
      `It is a bot that is designed to help you play League of Legends.`,
      `${bold('Prefix:')} ${codestring(` ${ctx.prefix} `)}.`,
      `View the commands by typing ${codestring(' /help ')}.`,
      `Currently, the bot only works with slash commands (${codestring(
        ' / ',
      )}).`,
      `You can also join the support server by clicking the button below.`,
    ];

    return await ctx.editOrReply({
      content: Content.join('\n'),
      components: [Buttons],
    });
  }
}
