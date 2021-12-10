import BaseCommand from '../../../Classes/BaseComand';
import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { codeblock } from 'detritus-client/lib/utils/markup';
import { inspect } from 'util';
import { CommandTypes } from '../../../Utils/constants';

export interface CommandArgs {
  code: string;
}

export const commandName = 'eval';

export default class Eval extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: commandName,
      aliases: ['ev', 'e'],
      label: 'code',
      metadata: {
        description: 'Eval some code.',
        examples: [`${commandName} ctx.client.token`, `${commandName} this`],
        type: CommandTypes.PRIVATE,
        usage: `${commandName} [code]`,
        onlyDevs: true,
        nsfw: false,
        disabled: {
          is: false,
          reason: null,
          severity: null,
          date: 0,
        },
      },
      args: [{ name: 'code', type: 'string' }],
      onBeforeRun: async (context: Context, args: CommandArgs) => {
        return (
          context.user.isClientOwner || context.userId == '507367752391196682'
        );
      },
      onCancelRun: async (ctx) =>
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

  async run(ctx: Context, args: CommandArgs) {
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
              content: codeblock(evaluated, {
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
              content: codeblock(evaluated, {
                language: 'js',
                limit: 1980,
              }),
            });
          });
      } else {
        if (typeof evaluated !== 'string')
          evaluated = inspect(evaluated, { depth: 0 });
        await ctx
          .editOrReply({
            content: codeblock(evaluated, {
              language: 'js',
              limit: 1980,
            }),
          })
          .catch((error: Error) => {
            ctx.editOrReply({
              content: codeblock(`${error.name}: ${error.message}.`, {
                language: 'js',
                limit: 1980,
              }),
            });
          });
      }
    } catch (error) {
      await ctx.editOrReply({
        content: codeblock(
          `${(error as Error).name}: ${(error as Error).message}.`,
          {
            language: 'js',
            limit: 1980,
          },
        ),
      });
    }
  }
}
