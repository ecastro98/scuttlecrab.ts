import { Command, Utils } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { FailedPermissions } from 'detritus-client/lib/interaction';
import { DiscordPermissions } from '../constants';
const { Embed, Markup } = Utils;

export default class BaseCommand<
  ParsedArgsFinished = Command.ParsedArgs,
> extends Command.Command<ParsedArgsFinished> {
  onDmBlocked(ctx: Context) {
    const command = Markup.codestring(ctx.command.name);
    return ctx.editOrReply({
      content: `⚠ Command ${command} cannot be used in a DM.`,
    });
  }

  onRunError(ctx: Context, args: ParsedArgsFinished, error: any) {
    const embed = new Embed()
      .setTitle(`⚠ Command Error`)
      .setDescription(Markup.codestring(String(error)));

    return ctx.editOrReply({
      embeds: [embed],
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

  onValueError(
    ctx: Context,
    args: Command.ParsedArgs,
    errors: Command.ParsedErrors,
  ) {
    const embed = new Embed()
      .setColor(0xffff00)
      .setTitle(`⚠ Command Argument Error`);

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
    return ctx.editOrReply({
      embeds: [embed],
    });
  }
}
