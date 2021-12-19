import { InteractionContext } from 'detritus-client/lib/interaction';
import { codestring } from 'detritus-client/lib/utils/markup';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { ScuttleMusicManager } from '../../../run';
import { CommandTypes } from '../../../Utils/constants';
import { Emojis } from '../../../Utils/emojis';

export interface CommandArgs {
  amount: number;
}

export const commandName = 'volume';

export class Volume extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Change the volume of the current queue.',
      metadata: {
        description: 'Change the volume of the current queue.',
        examples: [`${commandName} amount: 50`],
        type: CommandTypes.MUSIC,
        usage: `${commandName} <amount: Number>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'amount',
          type: 10,
          required: true,
          description: 'The amount to change the volume.',
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

  async run(ctx: InteractionContext, { amount }: CommandArgs) {
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

    if (!isNumber(String(amount))) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} The volume must be a number.`,
      });
    }

    if (amount < 0 || amount > 120) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} The volume must be between 0 and 100.`,
      });
    }

    guild_player.setVolume(amount);

    return await ctx.editOrRespond({
      content: `${Emojis.CHECK} Volume set to ${codestring(`${amount}%`)}.`,
    });
  }
}

function isNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value as unknown as number);
}
