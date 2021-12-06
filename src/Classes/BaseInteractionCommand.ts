import { Interaction, Structures, Utils } from 'detritus-client';
import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
} from 'detritus-client/lib/constants';
import { ComponentActionRow, ComponentButton } from 'detritus-client/lib/utils';
import { bold, codeblock, codestring } from 'detritus-client/lib/utils/markup';
import { DiscordPermissions, EmbedColors } from '../Utils/constants';
import { Emojis } from '../Utils/emojis';
const { Embed } = Utils;
const happened = Date.now();

export interface CommandMetadata {
  description: string;
  examples: Array<String>;
  type: string;
  usage: string;
  onlyDevs: boolean;
  nsfw: boolean;
  disabled: boolean;
}

export class BaseInteractionCommand<
  ParsedArgsFinished = Interaction.ParsedArgs,
> extends Interaction.InteractionCommand<ParsedArgsFinished> {
  declare metadata: CommandMetadata;

  async onDmBlocked(ctx: Interaction.InteractionContext) {
    const command = codestring(ctx.command.name);
    return await ctx
      .editOrRespond({
        content: `${Emojis.warning} Command ${command} cannot be used in a DM.`,
      })
      .catch(() => false);
  }

  async onRatelimit(
    ctx: Interaction.InteractionContext,
    ratelimits: Interaction.CommandRatelimitInfo[],
    metadata: Interaction.CommandRatelimitMetadata,
  ) {
    for (const rate of ratelimits) {
      const { item, remaining, ratelimit } = rate;
      if (item.usages - 1 > ratelimit.limit) return;

      const user = bold(ctx.user.username);
      const command = codestring(ctx.command.name);
      const timeRemaining = codestring(`${(remaining / 1000).toFixed(2)}`);
      const end = remaining < 1000 ? 'milliseconds' : 'seconds';

      switch (ratelimit.type) {
        case 'user':
          await ctx
            .editOrRespond({
              content: `${Emojis.warning} ${user}, you are using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
            })
            .catch(() => false);
          break;
        case 'guild':
          await ctx
            .editOrRespond({
              content: `${Emojis.warning} This guild is using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
            })
            .catch(() => false);
          break;
        case 'channel':
          await ctx
            .editOrRespond({
              content: `${Emojis.warning} This channel is using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
            })
            .catch(() => false);
          break;
      }
    }
  }

  async onRunError(
    ctx: Interaction.InteractionContext,
    args: ParsedArgsFinished,
    error: any,
  ) {
    const embed = new Embed()
      .setTitle(`Command Error`)
      .setColor(EmbedColors.ERROR)
      .setDescription(codeblock(String(error), { language: 'js' }))
      .setFooter('Report it on the support server.');

    const Button = new ComponentActionRow({
      components: [
        new ComponentButton()
          .setStyle(5)
          .setLabel('Support')
          .setUrl('https://discord.gg/pE6efwjXYJ'),
      ],
    });

    await ctx.guilds
      .get(process.env.guildId as string)!
      .channels.get('915804610780872714')!
      .createMessage({
        content: '<@!221399196480045056>,',
        embeds: [
          new Embed()
            .setTitle(`Command Error`)
            .setColor(EmbedColors.ERROR)
            .setDescription(
              codeblock(String(error.stack.substring(0, 4000)), {
                language: 'js',
              }),
            )
            .setFooter(`Slash Command: ${ctx.command.name}.`),
        ],
      })
      .catch(() => false);

    return await ctx
      .editOrRespond({
        embeds: [embed],
        components: [Button],
      })
      .catch(() => false);
  }

  async onPermissionsFail(
    ctx: Interaction.InteractionContext,
    failed: Interaction.FailedPermissions,
  ) {
    const permissions: Array<string> = [];

    for (const permission of failed) {
      const key = String(permission);
      if (key in DiscordPermissions) {
        const text = DiscordPermissions[key];
        permissions.push(text);
      } else {
        permissions.push(`Unknown Permission '${key}'`);
      }
    }

    const embed_no_user_permissions = new Embed()
      .setColor(EmbedColors.ERROR)
      .setTitle('Missing Permissions')
      .setDescription(
        `${Emojis.warning} You do not have the necessary permissions to execute the command.`,
      )
      .addField(
        'Necessary Permissions',
        codeblock(permissions.map((x) => `${x}: ${Emojis.x}`).join('.\n')),
      )
      .setTimestamp(happened)
      .setFooter(`${ctx.command.name} command`);

    return await ctx
      .editOrRespond({
        embeds: [embed_no_user_permissions],
      })
      .catch(() => false);
  }

  async onPermissionsFailClient(
    ctx: Interaction.InteractionContext,
    failed: Interaction.FailedPermissions,
  ) {
    const permissions: Array<string> = [];

    for (const permission of failed) {
      const key = String(permission);
      if (key in DiscordPermissions) {
        const text = DiscordPermissions[key];
        permissions.push(text);
      } else {
        permissions.push(`Unknown Permission '${key}'`);
      }
    }

    const embed_no_client_permissions = new Embed()
      .setColor(EmbedColors.ERROR)
      .setTitle('Missing Permissions')
      .setDescription(
        `${Emojis.warning} I do not have the necessary permissions to execute the command.`,
      )
      .addField(
        'Necessary Permissions',
        codeblock(permissions.map((x) => `${x}: ${Emojis.x}`).join('\n')),
      )
      .setTimestamp(happened)
      .setFooter(`${ctx.command.name} command`);

    return await ctx
      .editOrRespond({
        embeds: [embed_no_client_permissions],
      })
      .catch(() => false);
  }

  async onValueError(
    ctx: Interaction.InteractionContext,
    args: Interaction.ParsedArgs,
    errors: Interaction.ParsedErrors,
  ) {
    const embed = new Embed()
      .setColor(EmbedColors.ERROR)
      .setTitle(`Command Argument Error`);

    const store: { [key: string]: string } = {};

    const description: Array<string> = ['❌ Argument Errors:'];
    for (const key in errors) {
      const message = errors[key].message;
      if (message in store) {
        description.push(
          `${Emojis.warning} **${key}**: Same error as **${store[message]}**.`,
        );
      } else {
        description.push(`${Emojis.warning} **${key}**: ${message}.`);
      }
      store[message] = key;
    }

    embed.setDescription(description.join('\n'));
    return await ctx
      .editOrRespond({
        embeds: [embed],
      })
      .catch(() => false);
  }
}

export class BaseCommandOption<
  ParsedArgsFinished = Interaction.ParsedArgs,
> extends Interaction.InteractionCommandOption<ParsedArgsFinished> {
  type = ApplicationCommandOptionTypes.SUB_COMMAND;
}

export class BaseCommandOptionGroup<
  ParsedArgsFinished = Interaction.ParsedArgs,
> extends Interaction.InteractionCommandOption<ParsedArgsFinished> {
  type = ApplicationCommandOptionTypes.SUB_COMMAND_GROUP;
}

export class BaseSlashCommand<
  ParsedArgsFinished = Interaction.ParsedArgs,
> extends BaseInteractionCommand<ParsedArgsFinished> {
  error = 'Slash Command';
  type = ApplicationCommandTypes.CHAT_INPUT;
}

export interface ContextMenuMessageArgs {
  message: Structures.Message;
}

export class BaseContextMenuMessageCommand extends BaseInteractionCommand<ContextMenuMessageArgs> {
  error = 'Message Context Menu';
  type = ApplicationCommandTypes.MESSAGE;
}

export interface ContextMenuUserArgs {
  member?: Structures.Member;
  user: Structures.User;
}

export class BaseContextMenuUserCommand extends BaseInteractionCommand<ContextMenuUserArgs> {
  error = 'User Context Menu';
  type = ApplicationCommandTypes.USER;
}

// function capitalizeFirstLetter(string: string) {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// }
