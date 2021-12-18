import { InteractionContext } from 'detritus-client/lib/interaction';
import { User } from 'detritus-client/lib/structures';
import { Embed } from 'detritus-client/lib/utils';
import { codestring, underline } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { ScuttleMusicManager } from '../../../run';
import { CommandTypes, EmbedColors } from '../../../Utils/constants';
import { Emojis } from '../../../Utils/emojis';
import { apiImages, createProgressBar, format } from '../../../Utils/functions';

export const commandName = 'nowplaying';

export class NowPlaying extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Check the current song.',
      metadata: {
        description: 'Check the current song.',
        examples: [commandName],
        type: CommandTypes.MUSIC,
        usage: commandName,
        onlyDevs: false,
        nsfw: false,
      },
      ratelimits: [
        { duration: 5500, limit: 1, type: 'user' },
        { duration: 7500, limit: 5, type: 'channel' },
        { duration: 13000, limit: 10, type: 'guild' },
      ],
      disableDm: true,
    });
  }

  async run(ctx: InteractionContext) {
    const guild_player = ScuttleMusicManager.players.get(ctx.guildId!);

    if (!ctx.member?.voiceState?.channel) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} You must be in a voice channel to use this command.`,
      });
    }

    if (!guild_player) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} There is no music playing in this guild.`,
      });
    }

    if (guild_player.voiceChannel !== ctx.member!.voiceState!.channelId) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} You must be in the same voice channel as me to use this command.`,
      });
    }

    if (!guild_player.queue.current) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} There is no music playing in this guild.`,
      });
    }

    const { current } = guild_player.queue;

    const embed = new Embed()
      .setTitle(underline(current.title))
      .setUrl(current.uri!)
      .setColor(EmbedColors.DEFAULT)
      .setThumbnail(apiImages(current.thumbnail!))
      .addField(
        underline('About'),
        [
          `${codestring('Duration:')} ${format(current.duration!)}.`,
          `${codestring('Channel Video:')} ${current.author}.`,
          `${codestring('Requested By:')} <@!${(current.requester as User).id}>.`,
          `${codestring('Voice Channel:')} <#${
            ctx.channels.get(guild_player.voiceChannel!)!.id
          }>.`,
        ].join('\n'),
      )
      .addField(
        underline('Progress Bar'),
        createProgressBar(
          guild_player.position,
          guild_player.queue.current.duration!,
          15,
        ),
      );

    await ctx.editOrRespond({ embeds: [embed] });
  }
}
