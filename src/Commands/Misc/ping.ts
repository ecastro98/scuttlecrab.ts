import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import BaseCommand from '../../Classes/BaseComand';

export default class Ping extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: 'ping',
      aliases: ['latency', 'pong'],
      metadata: {
        description: "Get the latency time of discord's API.",
        examples: ['ping', 'pong', 'latency'],
        category: 'Misc',
        usage: 'ping',
        onlyDevs: false,
        nsfw: false,
      },
      disableDm: false,
      ratelimit: { duration: 3000, limit: 1, type: 'user' },
      responseOptional: true,
    });
  }
  async run(ctx: Context) {
    const { gateway, rest } = await ctx.client.ping();
    return await ctx.editOrReply({
      content: `Pong! (gateway: ${gateway}ms) (rest: ${rest}ms).`,
    });
  }
}
