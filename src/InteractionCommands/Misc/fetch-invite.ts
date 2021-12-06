import {
  ApplicationCommandOptionTypes,
  MarkupTimestampStyles,
} from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { Embed } from 'detritus-client/lib/utils';
import { codestring, timestamp } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommand } from '../../Classes/BaseInteractionCommand';
import { CommandTypes, EmbedColors } from '../../Utils/constants';
import { Emojis } from '../../Utils/emojis';

export interface CommandArgs {
  code: string;
}

export const commandName = 'fetch-invite';

export default class FetchInvite extends BaseInteractionCommand {
  constructor() {
    super({
      name: commandName,
      description: 'Get information on an invitation to a server.',
      metadata: {
        description: 'Get information on an invitation to a server.',
        examples: [commandName],
        type: CommandTypes.MISC,
        usage: commandName,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'code',
          description: 'The invitation code.',
          type: ApplicationCommandOptionTypes.STRING,
          required: true,
        },
      ],
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
      ],
      disableDm: true,
    });
  }

  async run(ctx: InteractionContext, args: CommandArgs) {
    const regexp =
      /discord(?:(?:app)?\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/gi;
    let code = args.code;

    if (regexp.test(code)) {
      try {
        code = (regexp.exec(code) as RegExpExecArray)[1];
      } catch (error) {
        return await ctx.editOrRespond({
          content: `${Emojis.warning} Invitation code is not valid.`,
        });
      }
    }

    try {
      var invite = await ctx.rest.fetchInvite(code, {
        withCounts: true,
      });
    } catch (error: any) {
      if (error.response && error.response.statusCode === 404) {
        return await ctx.editOrRespond({
          content: `${Emojis.warning} Invitation code is not valid.`,
        });
      } else {
        return await ctx.editOrRespond({
          content: `${error.name}: ${error.message}.`,
        });
      }
    }
    if (invite) {
      const { guild, channel, inviter } = invite;
      const embed_success = new Embed()
        .setColor(EmbedColors.DEFAULT)
        .setTitle('Invitation Information')
        .setFooter(
          `Requested by: ${ctx.user.tag}.`,
          ctx.user.avatarUrlFormat(null, { size: 512 }),
        );

      if (inviter) {
        embed_success.addField(
          '> Inviter Information',
          [
            `User: ${codestring(inviter.tag)}.`,
            `Avatar URL: [${codestring(
              'Click here',
            )}](${inviter.avatarUrlFormat(null, { size: 512 })}).`,
            `Account Created At: ${timestamp(
              inviter.createdAtUnix,
              MarkupTimestampStyles.BOTH_LONG,
            )}.`,
          ].join('\n'),
          true,
        );
      }

      if (guild) {
        embed_success.setThumbnail(
          guild.iconUrlFormat(null, { size: 512 }) as string,
        );
        embed_success.addField(
          '> Guild Information',
          [
            `Name: ${codestring(guild.name)}.`,
            `Acronym: ${codestring(guild.acronym)}.`,
            `Created At: ${timestamp(
              guild.createdAtUnix,
              MarkupTimestampStyles.BOTH_LONG,
            )}.`,
          ].join('\n'),
          true,
        );
      }
      embed_success.addField(
        '> Code Information',
        [
          `URL: [${codestring('Click here')}](${invite.url}).`,
          `Uses: ${codestring(String(invite.uses || 'Not found'))}.`,
          `Max uses: ${codestring(String(invite.maxUses || 'Unlimited'))}.`,
          `Revoked: ${codestring(invite.revoked ? 'True' : 'False')}.`,
          `Created At: ${timestamp(
            invite.createdAtUnix,
            MarkupTimestampStyles.BOTH_LONG,
          )}.`,
          `Expires At: ${timestamp(
            invite.expiresAtUnix,
            MarkupTimestampStyles.BOTH_LONG,
          )}.`,
        ].join('\n'),
      );

      if (channel) {
        embed_success.addField(
          '> Channel Information',
          [
            `Name: ${codestring(channel.name)}.`,
            `Created At: ${timestamp(
              channel.createdAtUnix,
              MarkupTimestampStyles.BOTH_LONG,
            )}.`,
          ].join('\n'),
        );
      }

      return await ctx.editOrRespond({
        embeds: [embed_success],
      });
    } else {
      return await ctx.editOrRespond({
        content: `${Emojis.warning} Invitation code is not valid.`,
      });
    }
  }
}
