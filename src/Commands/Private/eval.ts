import { CommandClient, Utils } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { inspect } from 'util';
import BaseCommand from '../../Classes/BaseComand';

export default class Eval extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      aliases: ['ev', 'e'],
      label: 'code',
      metadata: {
        description: 'Eval some code.',
        examples: ['eval ctx.client.token', 'eval this'],
        category: 'Private',
        usage: 'eval [code]',
        onlyDevs: true,
        nsfw: false,
      },
      name: 'eval',
      args: [{ name: 'code', type: 'string' }],
      onBefore: async (ctx) => ctx.user.isClientOwner,
      onCancel: async (ctx) =>
        await ctx.editOrReply({
          content: '⚠️ Command available only to developers.',
        }),
      onError: async (ctx, err) => {
        await ctx.editOrReply(`${err.name}: ${err.message}.`);
        console.error(err);
      },
      disableDm: true,
      responseOptional: true,
    });
  }

  async run(ctx: Context, args: any) {
    try {
      if (!args.code || args.code === '') {
        return await ctx.editOrReply({
          content: '⚠️ You must enter the code you want to evaluate.',
        });
      }

      let evaluated = eval(args.code);
      if (evaluated instanceof Promise) {
        const m = await ctx.editOrReply({
          content: '⏱️ Evaluating the promise...',
        });
        evaluated
          .then(async (e) => {
            let evaluated = e;
            if (typeof evaluated !== 'string')
              evaluated = inspect(evaluated, { depth: 0 });
            await m.edit({
              content: Utils.Markup.codeblock(evaluated, {
                language: 'js',
                limit: 1980,
              }),
            });
          })
          .catch(async (e) => {
            let evaluated = e;
            if (typeof evaluated !== 'string')
              evaluated = inspect(evaluated, { depth: 0 });
            await m.edit({
              content: Utils.Markup.codeblock(evaluated, {
                language: 'js',
                limit: 1980,
              }),
            });
          });
      } else {
        if (typeof evaluated !== 'string')
          evaluated = inspect(evaluated, { depth: 0 });
        await ctx.editOrReply({
          content: Utils.Markup.codeblock(evaluated, {
            language: 'js',
            limit: 1980,
          }),
        });
      }
    } catch (error) {
      await ctx.editOrReply({
        content: Utils.Markup.codeblock(`${error.name}: ${error.message}.`, {
          language: 'js',
          limit: 1980,
        }),
      });
    }
  }
}
