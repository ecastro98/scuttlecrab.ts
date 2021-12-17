import {
  ApplicationCommandOptionTypes,
  ChannelTypes,
  Permissions,
} from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { codestring } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { ScuttleMusicManager } from '../../../run';
import { CommandTypes } from '../../../Utils/constants';
import { Emojis } from '../../../Utils/emojis';

export interface CommandArgs {
  query: string;
}

export const commandName = 'play';

export class Play extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Plays audio from YouTube, Soundcloud or Spotify.',
      metadata: {
        description: 'Plays audio from YouTube, Soundcloud or Spotify.',
        examples: [`${commandName} query: Enemy - Imagine Dragons`],
        type: CommandTypes.MUSIC,
        usage: `${commandName} <query: Song URL | Name>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'query',
          description: 'The song to play.',
          required: true,
          type: ApplicationCommandOptionTypes.STRING,
        },
      ],
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
      ],
      // permissionsClient: [
      //   Permissions.CONNECT,
      //   Permissions.SPEAK,
      //   Permissions.VIEW_CHANNEL,
      // ],
      disableDm: false,
    });
  }

  async run(ctx: InteractionContext, { query }: CommandArgs) {
    const voice = ctx.member?.voiceState;
    if (!voice || !voice.channel) {
      return await ctx.editOrRespond({
        content: `${Emojis.warning} You must be in a voice channel to use this command.`,
      });
    }

    if (voice!.channel.type === ChannelTypes.GUILD_STAGE_VOICE) {
      return await ctx.editOrRespond({
        content: `${Emojis.warning} You cannot use this command in a stage channel.`,
      });
    }

    const guild_player = ScuttleMusicManager.create({
      guild: ctx.guild!.id,
      voiceChannel: voice!.channel.id,
      textChannel: ctx.channel!.id,
      selfDeafen: true,
      volume: 100,
    });

    if (voice!.channel.id !== guild_player.voiceChannel) {
      return await ctx.editOrRespond({
        content: `${Emojis.warning} You must be in the same voice channel as me to use this command.`,
      });
    }

    if (guild_player.state != 'CONNECTED') {
      guild_player.connect();
    }

    // const player = ScuttleMusicManager.players.get(ctx.guild!.id);

    const search_result = await guild_player.search(query);

    const query_formated = codestring(query);

    switch (search_result.loadType) {
      case 'LOAD_FAILED':
      case 'NO_MATCHES':
        if (!guild_player.queue.current) guild_player.destroy();

        await ctx.editOrRespond({
          content: `${Emojis.warning} No results found for ${query_formated}.`,
        });
        break;

      case 'PLAYLIST_LOADED':
        search_result.tracks.forEach((track) => guild_player.queue.add(track));

        await ctx.editOrRespond({
          content: `${Emojis.check} Added ${codestring(
            String(search_result.tracks.length),
          )} tracks to the queue from ${codestring(
            search_result.playlist!.name,
          )} playlist.`,
        });

        if (!guild_player.playing && !guild_player.paused)
          await guild_player.play();
        break;

      case 'TRACK_LOADED':
        guild_player.queue.add(search_result.tracks[0]);

        await ctx.editOrRespond({
          content: `${Emojis.check} Added ${codestring(
            search_result.tracks[0].title,
          )} to the queue.`,
        });

        if (!guild_player.playing && !guild_player.paused)
          await guild_player.play();
        break;

      case 'SEARCH_RESULT':
        const track = search_result.tracks[0];
        guild_player.queue.add(track);

        await ctx.editOrRespond({
          content: `${Emojis.check} Added ${codestring(
            track.title,
          )} to the queue.`,
        });

        if (!guild_player.playing && !guild_player.paused)
          await guild_player.play();
        break;
    }
  }
}
