import { Command, CommandClient, Utils } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { FailedPermissions } from 'detritus-client/lib/interaction';
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
  disabled: {
    is?: false;
    reason?: string;
    severity?: string;
    date?: number;
  };
}

export default class BaseCommand<
  ParsedArgsFinished = Command.ParsedArgs,
> extends Command.Command<ParsedArgsFinished> {
  declare metadata: CommandMetadata;

  async onBefore(ctx: Context) {
    const disabled = ctx.command!.metadata?.disabled;

    if (disabled.is) {
      await ctx.editOrReply({
        embeds: [
          new Embed()
            .setColor(EmbedColors.ERROR)
            .setTitle('Disable Command')
            .setDescription(
              `${Emojis.WARNING} The ${codestring(
                ctx.command!.name,
              )} command is disabled.`,
            )
            .addField(
              'Information',
              codeblock(
                [
                  `Reason: ${disabled.reason}.`,
                  `Severity: ${disabled.severity}.`,
                  `Date: ${new Date(disabled.date).toLocaleString('en-US', {
                    timeZone: 'America/Mexico_City',
                  })} (America/Mexico City).`,
                ].join('\n'),
              ),
            ),
        ],
      });
      return false;
    }
    return true;
  }

  async onDmBlocked(ctx: Context) {
    const command = codestring(ctx.command!.name);
    return await ctx
      .editOrReply({
        content: `${Emojis.WARNING} Command ${command} cannot be used in a DM.`,
      })
      .catch(() => false);
  }

  async onRatelimit(
    ctx: Command.Context,
    ratelimits: Array<Command.CommandRatelimitInfo>,
    metadata: Command.CommandRatelimitMetadata,
  ) {
    for (const rate of ratelimits) {
      const { item, remaining, ratelimit } = rate;
      if (item.usages - 1 > ratelimit.limit) return;

      const user = bold(ctx.user.username);
      const command = codestring(ctx.command!.name);
      const timeRemaining = codestring(`${(remaining / 1000).toFixed(2)}`);
      const end = remaining < 1000 ? 'milliseconds' : 'seconds';

      if (!item.replied || !ctx.message.canReply) {
        switch (ratelimit.type) {
          case 'user':
            await ctx
              .editOrReply({
                content: `${Emojis.WARNING} ${user}, you are using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
              })
              .catch(() => false);
            break;
          case 'guild':
            await ctx
              .editOrReply({
                content: `${Emojis.WARNING} This guild is using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
              })
              .catch(() => false);
            break;
          case 'channel':
            await ctx
              .editOrReply({
                content: `${Emojis.WARNING} This channel is using the ${command} command too fast, wait ${timeRemaining} ${end}.`,
              })
              .catch(() => false);
            break;
        }
      }
    }
  }

  async onRunError(ctx: Context, args: ParsedArgsFinished, error: Error) {
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
              codeblock(String(error.stack!.substring(0, 4000)), {
                language: 'js',
              }),
            )
            .setFooter(`Command: ${ctx.command!.name}.`),
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
      .setColor(EmbedColors.ERROR)
      .setTitle('Missing Permissions')
      .setDescription(
        `${Emojis.WARNING} You do not have the necessary permissions to execute the command.`,
      )
      .addField(
        'Necessary Permissions',
        codeblock(permissions.map((x) => `${x}: ${Emojis.ERROR}`).join('.\n')),
      )
      .setTimestamp(happened)
      .setFooter(`${ctx.command!.name} command`);

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
      .setColor(EmbedColors.ERROR)
      .setTitle('Missing Permissions')
      .setDescription(
        `${Emojis.WARNING} I do not have the necessary permissions to execute the command.`,
      )
      .addField(
        'Necessary Permissions',
        codeblock(permissions.map((x) => `${x}: ${Emojis.ERROR}`).join('\n')),
      )
      .setTimestamp(happened)
      .setFooter(`${ctx.command!.name} command`);

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
      .setColor(EmbedColors.ERROR)
      .setTitle(`Command Argument Error`);

    const store: { [key: string]: string } = {};

    const description: Array<string> = ['❌ Argument Errors:'];
    for (const key in errors) {
      const message = errors[key].message;
      if (message in store) {
        description.push(
          `${Emojis.WARNING} **${key}**: Same error as **${store[message]}**.`,
        );
      } else {
        description.push(`${Emojis.WARNING} **${key}**: ${message}.`);
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
