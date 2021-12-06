import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommand } from '../../Classes/BaseInteractionCommand';
import { CommandTypes, EmbedColors } from '../../Utils/constants';
import { GatewayClientEvents } from 'detritus-client';
import { parseMessage } from '../../Utils/functions';
import {
  ExtraSearchData,
  fetchContent,
  findInData,
  LibData,
} from '../../Utils/contentFetch';
import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { Embed } from 'detritus-client/lib/utils';
import { Emojis } from '../../Utils/emojis';

export const commandName = 'docs';

export default class Docs extends BaseInteractionCommand {
  constructor() {
    super({
      name: commandName,
      description:
        'Look for something in the documentation of detritus-client.',
      options: [
        {
          name: 'query',
          required: true,
          description: 'The argument to search for.',
          type: ApplicationCommandOptionTypes.STRING,
          onAutoComplete: async (ctx) => {
            const choices: Array<{ name: string; value: string }> = [];
            let name = ctx.value;
            let member: any;
            if (name.includes('.')) {
              const [newName, newMember] = name.split('.');
              name = newName;
              member = newMember;
            }
            const results = findInData(
              { name, member },
              await fetchContent(process.env.docsUrl as string),
              {
                limit: 25,
                searchAll: true,
                excludeBase: true,
              },
            );
            if (results)
              choices.push(
                ...results.map((res) => {
                  const fullname =
                    res.obj.preparedWithParent?.target || res.obj.name;
                  return {
                    name: res.obj.preparedWithParent?.target || res.obj.name,
                    value: `${fullname}~${res.fullLink}`,
                  };
                }),
              );
            return ctx.respond({ choices: choices });
          },
        },
      ],

      metadata: {
        description:
          'Look for something in the documentation of detritus-client',
        examples: [`${commandName} BaseGuild`],
        type: CommandTypes.DOCS,
        usage: commandName,
        onlyDevs: false,
        nsfw: false,
      },
      ratelimits: [
        { duration: 6500, limit: 2, type: 'user' },
        { duration: 9500, limit: 5, type: 'channel' },
        { duration: 15000, limit: 10, type: 'guild' },
      ],
      disableDm: false,
    });
  }

  async run(ctx: InteractionContext) {
    const DATA = await fetchContent(process.env.docsUrl as string);
    if (!ctx.options) return;
    const query = ctx.options.get('query')!;
    if (!query.value) return;
    const [name, link] = (query.value as string).split('~');
    if (!link) {
      findAndSend(ctx, name, DATA, true, 8);
      return;
    }
    ctx.editOrRespond({
      embeds: [
        new Embed()
          .setAuthor(
            'Detritus Client Documentation',
            'https://cdn.discordapp.com/attachments/915654347394777161/917087714950664272/38723856.png',
            'https://googlefeud.github.io/docs-demo/',
          )
          .setTitle('Search Results')
          .setDescription(`**[${name}](${DATA.baseLink}${link})**`)
          .setColor(EmbedColors.DEFAULT)
          .setFooter(
            `Searched by: ${ctx.interaction.user.tag}.`,
            ctx.interaction.user.avatarUrl,
          ),
      ],
    });
  }
}

async function findAndSend(
  channel: GatewayClientEvents.MessageCreate | InteractionContext,
  queryStr: string,
  DATA: LibData,
  isParsed?: boolean,
  customLimit?: number,
): Promise<void> {
  const embeds = new Array<Embed>();
  const parsed = isParsed ? [{ name: queryStr }] : parseMessage(queryStr);
  const links: Array<ExtraSearchData> = [];
  const otherPossibilities = [];
  if (parsed && parsed.length) {
    for (const query of parsed) {
      const item = findInData(query, DATA, {
        highlight: '`',
        limit: customLimit || 3,
        threshold: query.exact ? -1 : -100,
      });
      if (
        item &&
        item.length &&
        !links.some((link) => link.obj === item[0].obj)
      ) {
        links.push(item[0]);
        if (item.length > 1 && item[0].obj.name !== query.name)
          otherPossibilities.push(...item.slice(1));
      }
    }
    if (!links.length) {
      if (channel instanceof InteractionContext)
        channel.editOrRespond({
          content: `${Emojis.warning} I could not find anything about the argument you have entered.`,
        });
      else channel.message.react('❌');
      return;
    }
    const messageAuthor =
      channel instanceof InteractionContext
        ? channel.user
        : channel.message.author;

    const embed_main = new Embed()
      .setColor(EmbedColors.DEFAULT)
      .setTitle('Search Results')
      .setDescription(
        links
          .map(
            (link) =>
              `**[${link.highlighted || link.obj.name}](${link.fullLink})**${
                link.obj.comment
                  ? ` - ${link.obj.comment.replace(/(\r\n|\n|\r)/gm, ', ')}...`
                  : ''
              }`,
          )
          .join('\n'),
      )
      .setAuthor(
        'Detritus Client Documentation',
        'https://cdn.discordapp.com/attachments/915654347394777161/917087714950664272/38723856.png',
        'https://googlefeud.github.io/docs-demo/',
      )
      .setFooter(`Searched by: ${messageAuthor.tag}.`, messageAuthor.avatarUrl);

    embeds.push(embed_main);

    if (otherPossibilities.length) {
      const embed = new Embed()
        .setTitle('Other results with your search')
        .setColor(EmbedColors.DEFAULT)
        .setDescription(
          otherPossibilities.length
            ? otherPossibilities
                .map(
                  (link) =>
                    `**[${link.highlighted || link.obj.name}](${
                      link.fullLink
                    })**${
                      link.obj.comment
                        ? ` - ${link.obj.comment.replace(
                            /(\r\n|\n|\r)/gm,
                            ', ',
                          )}...`
                        : ''
                    }`,
                )
                .join('\n')
            : 'No other results were found.',
        )
        .setAuthor(
          'Detritus Client Documentation',
          'https://cdn.discordapp.com/attachments/915654347394777161/917087714950664272/38723856.png',
          'https://googlefeud.github.io/docs-demo/',
        );
      embeds.push(embed);
    }
    if (channel instanceof InteractionContext) {
      await channel.editOrRespond({ embeds: embeds });
    } else {
      await channel.message.client.rest.createMessage(
        channel.message.channelId,
        {
          embeds: embeds,
        },
      );
    }
  }
}
