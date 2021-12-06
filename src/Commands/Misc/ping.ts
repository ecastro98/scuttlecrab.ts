import BaseCommand from '../../Classes/BaseComand';
import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { CommandTypes } from '../../Utils/constants';

export const commandName = 'ping';

export default class Ping extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: commandName,
      aliases: ['latency', 'pong'],
      metadata: {
        description: "Get the latency time of discord's API.",
        examples: [commandName, 'pong', 'latency'],
        type: CommandTypes.MISC,
        usage: commandName,
        onlyDevs: false,
        nsfw: false,
        disabled: {
          is: false,
          reason: null,
          severity: null,
          date: 0,
        },
      },
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
      ],
      disableDm: false,
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
