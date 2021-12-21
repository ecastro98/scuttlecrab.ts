import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { CommandTypes } from '../../../Utils/constants';
import { redisPingMS } from '../../../Utils/functions';

export const commandName = 'ping';

export class Ping extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: "Get the latency time of discord's API.",
      metadata: {
        description: "Get the latency time of discord's API.",
        examples: [commandName],
        type: CommandTypes.MISC,
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
    const { gateway, rest } = await ctx.client.ping();
    return await ctx.editOrRespond({
      content: `Pong! (gateway: ${gateway}ms) (rest: ${rest}ms) (redis: ${await redisPingMS()}ms).`,
    });
  }
}
