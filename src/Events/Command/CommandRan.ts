import { CommandClient } from 'detritus-client';
import { MarkupTimestampStyles } from 'detritus-client/lib/constants';
import { codestring, timestamp, bold } from 'detritus-client/lib/utils/markup';
import { CommandEvents } from 'detritus-client/lib/command/events';

export default {
  name: 'commandRan',
  run: async (
    { command, context }: CommandEvents.CommandRan,
    commandClient: CommandClient,
  ) => {
    if (command.name === 'eval') return;

    const channel = context.guilds
      .get(process.env.guildId as string)!
      .channels.get('915654402394693642')!;

    if (!channel) return;

    const cmd = codestring(command.name);

    const author = `${codestring(context.user.tag)} | ${codestring(
      context.user.id,
    )}`;

    const guild = `${codestring(context.guild!.name)} | ${codestring(
      context.guild!.id,
    )}`;

    const date = timestamp(
      context.message.timestampUnix,
      MarkupTimestampStyles.BOTH_LONG,
    );

    const array = [
      `${codestring('🤖')} ${bold('Command Executed')}`,
      '\u200B',
      `Command: ${cmd}.`,
      `Type: ${codestring('Prefixed')}.`,
      `Author: ${author}.`,
      `Guild: ${guild}.`,
      `Date: ${date}.`,
    ] as const;

    await channel.createMessage({
      content: array.join('\n'),
    });
  },
};
