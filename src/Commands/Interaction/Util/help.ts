import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { Embed } from 'detritus-client/lib/utils';
import { bold, codeblock, underline } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommand } from '../../../Classes/BaseInteractionCommand';
import { CommandTypes, EmbedColors } from '../../../Utils/constants';

export interface CommandArgs {
  category: string;
}

export const commandName = 'help';

export default class Help extends BaseInteractionCommand {
  constructor() {
    super({
      name: commandName,
      description: 'Get the list of commands from the bot.',
      metadata: {
        description: 'Get the list of commands from the bot.',
        examples: [commandName, `${commandName} category: League of Legends`],
        type: CommandTypes.UTIL,
        usage: `${commandName} <category: Category>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          description: 'Category to get commands.',
          name: 'category',
          type: ApplicationCommandOptionTypes.STRING,
          choices: [
            {
              name: CommandTypes.LOL,
              value: CommandTypes.LOL,
            },
            {
              name: CommandTypes.VALORANT,
              value: CommandTypes.VALORANT,
            },
            {
              name: CommandTypes.MISC,
              value: CommandTypes.MISC,
            },
            {
              name: CommandTypes.DOCS,
              value: CommandTypes.DOCS,
            },
            {
              name: 'Uncategorized',
              value: 'Uncategorized',
            },
          ],
          required: true,
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
    const { category } = args;

    if (category) {
      switch (category) {
        case CommandTypes.LOL:
          const lol_cmds = ctx?.interactionCommandClient?.commands
            ?.filter((x) => x.name === 'lol')[0]
            ?.options!.map((x) => `${bold(x.name)}: ${x.description}`);

          const lol_embed = new Embed()
            .setTitle(underline('League of Legends Commands'))
            .setColor(EmbedColors.DEFAULT)
            .setDescription(lol_cmds.join('\n'))
            .addField(underline('Usage'), codeblock('/lol <command> [options]'))
            .setFooter(
              'You must not include < > or [ ] when using the commands.',
            );
          await ctx.editOrRespond({
            embeds: [lol_embed],
          });
          break;

        case CommandTypes.VALORANT:
          const valorant_cmds = ctx?.interactionCommandClient?.commands
            ?.filter((x) => x.name === 'valorant')[0]
            ?.options!.map((x) => `${bold(x.name)}: ${x.description}`);

          const valorant_embed = new Embed()
            .setTitle(underline('Valorant Commands'))
            .setColor(EmbedColors.DEFAULT)
            .setDescription(valorant_cmds.join('\n'))
            .addField(
              underline('Usage'),
              codeblock('/valorant <command> [options]'),
            )
            .setFooter(
              'You must not include < > or [ ] when using the commands.',
            );
          await ctx.editOrRespond({
            embeds: [valorant_embed],
          });
          break;

        case CommandTypes.DOCS:
          const docs_cmds = ctx?.interactionCommandClient?.commands
            ?.filter((x) => x.name === 'detritus')[0]
            ?.options!.map((x) => `${bold(x.name)}: ${x.description}`);

          const docs_embed = new Embed()
            .setTitle(underline('Detritus Client Commands'))
            .setColor(EmbedColors.DEFAULT)
            .setDescription(docs_cmds.join('\n'))
            .addField(
              underline('Usage'),
              codeblock('/detritus <command> [options]'),
            )
            .setFooter(
              'You must not include < > or [ ] when using the commands.',
            );
          await ctx.editOrRespond({
            embeds: [docs_embed],
          });
          break;

        case CommandTypes.MISC:
          const misc_cmds = ctx?.interactionCommandClient?.commands
            ?.filter((x) => x.name === 'misc')[0]
            ?.options!.map((x) => `${bold(x.name)}: ${x.description}`);

          const misc_embed = new Embed()
            .setTitle(underline('Misc Commands'))
            .setColor(EmbedColors.DEFAULT)
            .setDescription(misc_cmds.join('\n'))
            .addField(
              underline('Usage'),
              codeblock('/misc <command> [options]'),
            )
            .setFooter(
              'You must not include < > or [ ] when using the commands.',
            );
          await ctx.editOrRespond({
            embeds: [misc_embed],
          });
          break;

        case 'Uncategorized':
          const uncategorized_cmds = ctx?.interactionCommandClient?.commands
            ?.filter(
              (x) =>
                x.name !== 'detritus' && x.name !== 'lol' && x.name !== 'misc',
            )
            ?.map((x) => `${bold(x.name)}: ${x.description}`);

          const uncategorized_embed = new Embed()
            .setTitle(underline('Uncategorized Commands'))
            .setColor(EmbedColors.DEFAULT)
            .setDescription(uncategorized_cmds.join('\n'))
            .addField(underline('Usage'), codeblock('/<command> [options]'))
            .setFooter(
              'You must not include < > or [ ] when using the commands.',
            );
          await ctx.editOrRespond({
            embeds: [uncategorized_embed],
          });
          break;
      }
    }
  }
}
