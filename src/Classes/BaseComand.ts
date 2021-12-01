import { Command, Utils } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { FailedPermissions } from 'detritus-client/lib/interaction';
import { ComponentActionRow, ComponentButton } from 'detritus-client/lib/utils';
import { DiscordPermissions } from '../Utils/constants';
const { Embed, Markup } = Utils;

export default class BaseCommand<
  ParsedArgsFinished = Command.ParsedArgs,
> extends Command.Command<ParsedArgsFinished> {
  async onDmBlocked(ctx: Context) {
    const command = Markup.codestring(ctx.command.name);
    return await ctx.editOrReply({
      content: `⚠ Command ${command} cannot be used in a DM.`,
    });
  }

  async onRatelimit(
    ctx: Command.Context,
    ratelimits: Array<Command.CommandRatelimitInfo>,
    metadata: Command.CommandRatelimitMetadata,
  ) {
    const { item, remaining, ratelimit } = ratelimits[0];

    if (item.usages - 1 > ratelimit.limit) return;

    const user = Markup.bold(ctx.user.username);
    const command = Markup.codestring(ctx.command.name);
    const timeRemaining = Markup.codestring(`${(remaining / 1000).toFixed(2)}`);
    const end = remaining < 1000 ? 'milliseconds' : 'seconds';

    if (!item.replied || !ctx.message.canReply) {
      switch (ratelimit.type) {
        case 'user':
          await ctx.editOrReply({
            content: `⚠️ ${user}, you are using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
          });
          break;

        case 'guild':
          await ctx.editOrReply({
            content: `⚠️ This guild is using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
          });
          break;

        case 'channel':
          await ctx.editOrReply({
            content: `⚠️ This channel is using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
          });
          break;
      }
    }
  }

  async onRunError(ctx: Context, args: ParsedArgsFinished, error: any) {
    const embed = new Embed()
      .setTitle('Command Error')
      .setColor(0xff0000)
      .setDescription(Markup.codeblock(String(error), { language: 'js' }));

    const Button = new ComponentActionRow({
      components: [
        new ComponentButton()
          .setStyle(5)
          .setLabel('Support')
          .setUrl('https://discord.gg/pE6efwjXYJ'),
      ],
    });

    return await ctx.editOrReply({
      embeds: [embed],
      components: [Button],
    });
  }

  async onPermissionsFail(ctx: Context, failed: FailedPermissions) {
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
      .setColor(0xffff00)
      .setDescription(
        failed.length > 1
          ? `⚠️ You need these permissions: ${permissions
              .map((x) => `**${x}**`)
              .join(', ')}.`
          : `⚠️ You need this permission: ${permissions
              .map((x) => `**${x}**`)
              .join(', ')}.`,
      );

    return await ctx.editOrReply({
      embeds: [embed_no_user_permissions],
    });
  }

  async onPermissionsFailClient(ctx: Context, failed: FailedPermissions) {
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
      .setColor(0xffff00)
      .setDescription(
        failed.length > 1
          ? `⚠️ I'm missing permissions: ${permissions
              .map((x) => `**${x}**`)
              .join(', ')}.`
          : `⚠️ I'm missing permission: ${permissions
              .map((x) => `**${x}**`)
              .join(', ')}.`,
      );

    return await ctx.editOrReply({
      embeds: [embed_no_client_permissions],
    });
  }

  async onValueError(
    ctx: Context,
    args: Command.ParsedArgs,
    errors: Command.ParsedErrors,
  ) {
    const embed = new Embed()
      .setColor(0xffff00)
      .setTitle(`Command Argument Error`);

    const store: { [key: string]: string } = {};

    const description: Array<string> = ['Invalid Arguments'];
    for (const key in errors) {
      const message = errors[key].message;
      if (message in store) {
        description.push(`⚠️ **${key}**: Same error as **${store[message]}**.`);
      } else {
        description.push(`⚠️ **${key}**: ${message}.`);
      }
      store[message] = key;
    }

    embed.setDescription(description.join('\n'));
    return await ctx.editOrReply({
      embeds: [embed],
    });
  }
}
