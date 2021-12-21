import { Embed } from 'detritus-client/lib/utils';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { codestring, underline } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommand } from '../../../Classes/BaseInteractionCommand';
import { CommandTypes, EmbedColors } from '../../../Utils/constants';
import { freemem, platform, totalmem } from 'os';
import {
  capitalize,
  formatBytes,
  formatTime,
  redisPingMS,
} from '../../../Utils/functions';

export const commandName = 'stats';

export default class Stats extends BaseInteractionCommand {
  constructor() {
    super({
      name: commandName,
      description: 'Get the bot statistics.',
      metadata: {
        description: 'Get the bot statistics.',
        examples: [commandName],
        type: CommandTypes.UTIL,
        usage: commandName,
        onlyDevs: false,
        nsfw: false,
      },
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
      ],
      disableDm: false,
    });
  }

  async run(ctx: InteractionContext) {
    const guilds = ctx.client.guilds.size;
    const users = ctx.guilds
      .reduce((c, v) => c + v.memberCount, 0)
      .toLocaleString();
    const owners = ctx.client.owners.map((v) => v.tag)[1];
    const { gateway, rest } = await ctx.client.ping();

    const messages = [
      `${codestring('Guilds:')} ${guilds}.`,
      `${codestring('Users:')} ${users}.`,
      `${codestring('Developer:')} ${owners}.`,
      `${codestring('Gateway Ping:')} ${gateway}ms.`,
      `${codestring('Rest Ping:')} ${rest}ms.`,
      `${codestring('Redis Ping:')} ${await redisPingMS()}ms.`,
    ];

    const system_stats = [
      `${codestring('Platform:')} ${capitalize(platform().toLowerCase())}.`,
      `${codestring('RAM:')} ${formatBytes(
        totalmem() - freemem(),
      )} / ${formatBytes(totalmem())}.`,
      `${codestring('RAM Bot Usage:')} ${formatBytes(
        process.memoryUsage().heapUsed,
      )} / ${formatBytes(process.memoryUsage.rss())}.`,
      `${codestring('Uptime:')} ${formatTime(
        Number(process.uptime().toFixed(0)),
      )}.`,
    ];

    const embed = new Embed()
      .setColor(EmbedColors.DEFAULT)
      .setTitle(underline('Client Stats'))
      .setDescription(messages.join('\n'))
      .setThumbnail(ctx.client.user!.avatarUrlFormat('png', { size: 128 }))
      .addField(underline('System Stats'), system_stats.join('\n'));

    await ctx.editOrRespond({
      embeds: [embed],
    });
  }
}
