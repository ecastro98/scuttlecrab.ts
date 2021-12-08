import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { Embed } from 'detritus-client/lib/utils';
import { codeblock, underline } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommand } from '../../Classes/BaseInteractionCommand';
import {
  CommandTypes,
  DiscordPermissions,
  EmbedColors,
} from '../../Utils/constants';
import { Emojis } from '../../Utils/emojis';
import { capitalize, getCommandInfo, getCommands } from '../../Utils/functions';

export interface CommandArgs {
  command: string;
}

export const commandName = 'help';

export default class Help extends BaseInteractionCommand {
  constructor() {
    super({
      name: commandName,
      description: 'Get the list of commands from the bot or on a command.',
      metadata: {
        description: 'Get the list of commands from the bot or on a command.',
        examples: [commandName, `${commandName} ping`],
        type: CommandTypes.UTIL,
        usage: `${commandName} (command)`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'command',
          required: false,
          description: 'The command you wish to obtain information.',
          default: null,
          type: ApplicationCommandOptionTypes.STRING,
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
    const command = getCommandInfo(ctx, args.command, 'interaction');

    if (args?.command && !command) {
      return ctx.editOrRespond({
        content: `${Emojis.warning} Unknown command.`,
      });
    }

    if (args?.command && command) {
      const embed_command_success = new Embed()
        .setColor(EmbedColors.DEFAULT)
        .setTitle(`Slash Command ${capitalize(command.name)}`)
        .addField(
          underline('Metadata'),
          codeblock(
            [
              `Category: ${command.category}.`,
              `Usage: /${command.metadata.usage}.`,
              `Examples: ${command.metadata.examples
                .map((x: string) => `/${x}`)
                .join(' | ')}.`,
              `Only devs: ${command.metadata.onlyDevs ? 'True' : 'False'}.`,
              `NSFW: ${command.metadata.nsfw ? 'True' : 'False'}.`,
            ].join('\n'),
          ),
        )
        .addField(
          underline('Rate Limit'),
          codeblock(
            command.ratelimits
              .map(
                (x) =>
                  `${capitalize(x.type as string)}: ${
                    x.duration / 1000
                  } seconds (${x.limit} usages per ${x.type}).`,
              )
              .join('\n'),
          ),
        )
        .addField(
          underline('Permissions'),
          codeblock(
            [
              `Client: ${
                command.permissionsClient
                  .map((x) => DiscordPermissions[String(x || 0)])
                  .join(', ') || 'None'
              }.`,
              `Author: ${
                command.permissions
                  .map((x) => DiscordPermissions[String(x || 0)])
                  .join(', ') || 'None'
              }.`,
            ].join('\n'),
          ),
        );

      return await ctx.editOrRespond({
        embeds: [embed_command_success],
      });
    }

    const embed_help_success = new Embed()
      .setColor(EmbedColors.DEFAULT)
      .setTitle('Command List')
      .addField(
        underline('Detritus'),
        getCommands(
          ctx,
          'Detritus Client',
          'interaction',
          true,
          ', ',
        ) as string,
      )
      .addField(
        underline('Image'),
        getCommands(ctx, 'Image', 'interaction', true, ', ') as string,
      )
      .addField(
        underline('Misc'),
        getCommands(ctx, 'Misc', 'interaction', true, ', ') as string,
      )
      .addField(
        underline('Util'),
        getCommands(ctx, 'Util', 'interaction', true, ', ') as string,
      );

    return await ctx.editOrRespond({
      embeds: [embed_help_success],
    });
  }
}
