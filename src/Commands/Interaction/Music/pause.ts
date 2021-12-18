import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { ScuttleMusicManager } from '../../../run';
import { CommandTypes } from '../../../Utils/constants';
import { Emojis } from '../../../Utils/emojis';

export const commandName = 'pause';

export class Pause extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Pause the current song.',
      metadata: {
        description: 'Pause the current song.',
        examples: [commandName],
        type: CommandTypes.MUSIC,
        usage: commandName,
        onlyDevs: false,
        nsfw: false,
      },
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
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

    if (!guild_player.playing) {
      guild_player.pause(false);

      return await ctx.editOrRespond({
        content: `${Emojis.PLAY} The current song has resumed.`,
      });
    }

    guild_player.pause(true);

    await ctx.editOrRespond({
      content: `${Emojis.PAUSE} Paused the current song.`,
    });
  }
}
