import { Command, Utils } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { FailedPermissions } from 'detritus-client/lib/interaction';
import { ComponentActionRow, ComponentButton } from 'detritus-client/lib/utils';
import { bold, codeblock, codestring } from 'detritus-client/lib/utils/markup';
import { DiscordPermissions } from '../Utils/constants';
import { emojis } from '../Utils/emojis';
const { Embed } = Utils;

export default class BaseCommand<
  ParsedArgsFinished = Command.ParsedArgs,
> extends Command.Command<ParsedArgsFinished> {
  emojis = emojis;

  async onDmBlocked(ctx: Context) {
    const command = codestring(ctx.command.name);
    return await ctx
      .editOrReply({
        content: `${this.emojis.warning} Command ${command} cannot be used in a DM.`,
      })
      .catch(() => false);
  }

  async onRatelimit(
    ctx: Command.Context,
    ratelimits: Array<Command.CommandRatelimitInfo>,
    metadata: Command.CommandRatelimitMetadata,
  ) {
    const { item, remaining, ratelimit } = ratelimits[0];

    if (item.usages - 1 > ratelimit.limit) return;

    const user = bold(ctx.user.username);
    const command = codestring(ctx.command.name);
    const timeRemaining = codestring(`${(remaining / 1000).toFixed(2)}`);
    const end = remaining < 1000 ? 'milliseconds' : 'seconds';

    if (!item.replied || !ctx.message.canReply) {
      switch (ratelimit.type) {
        case 'user':
          await ctx
            .editOrReply({
              content: `${this.emojis.warning} ${user}, you are using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
            })
            .catch(() => false);
          break;

        case 'guild':
          await ctx
            .editOrReply({
              content: `${this.emojis.warning} This guild is using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
            })
            .catch(() => false);
          break;

        case 'channel':
          await ctx
            .editOrReply({
              content: `${this.emojis.warning} This channel is using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
            })
            .catch(() => false);
          break;
      }
    }
  }

  async onRunError(ctx: Context, args: ParsedArgsFinished, error: Error) {
    const embed = new Embed()
      .setTitle(`Command Error`)
      .setColor(0xff0000)
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
      .get(process.env.guildId)
      .channels.get('915804610780872714')
      .createMessage({
        content: '<@!221399196480045056>,',
        embeds: [
          new Embed()
            .setTitle(`Command Error`)
            .setColor(0xff0000)
            .setDescription(
              codeblock(String(error.stack.substring(0, 4000)), {
                language: 'js',
              }),
            )
            .setFooter(`Command: ${ctx.command.name}.`),
        ],
      })
      .catch(() => false);

    if (!ctx.message.canReply && !ctx.canReply) {
      return await ctx
        .editOrReply({
          embeds: [embed],
          components: [Button],
        })
        .catch(() => false);
    }
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
      .setColor(0xff0000)
      .setDescription(
        failed.length > 1
          ? `You need these permissions:\n\n${permissions
              .map((x) => `${this.emojis.x} ${bold(x)}.`)
              .join('\n')}`
          : `You need this permission:\n\n${permissions
              .map((x) => `${this.emojis.x} ${bold(x)}.`)
              .join('\n')}`,
      );

    return await ctx
      .editOrReply({
        embeds: [embed_no_user_permissions],
      })
      .catch(() => false);
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
          ? `I'm missing permissions:\n\n${permissions
              .map((x) => `${this.emojis.x} ${bold(x)}.`)
              .join('\n')}.`
          : `I'm missing permission:\n\n${permissions
              .map((x) => `${this.emojis.x} ${bold(x)}.`)
              .join('\n')}.`,
      );

    return await ctx
      .editOrReply({
        embeds: [embed_no_client_permissions],
      })
      .catch(() => false);
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
        description.push(
          `${this.emojis.warning} **${key}**: Same error as **${store[message]}**.`,
        );
      } else {
        description.push(`${this.emojis.warning} **${key}**: ${message}.`);
      }
      store[message] = key;
    }

    embed.setDescription(description.join('\n'));
    return await ctx
      .editOrReply({
        embeds: [embed],
      })
      .catch(() => false);
  }
}
