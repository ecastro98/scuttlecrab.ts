import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../Classes/BaseInteractionCommand';
import { CommandTypes, EmbedColors } from '../../Utils/constants';
import { GatewayClientEvents } from 'detritus-client';
import { parseMessage } from '../../Utils/functions';
import fetch from 'node-fetch';
import { decode } from 'html-entities';
import {
  ExtraSearchData,
  fetchContent,
  findInData,
  LibData,
} from '../../Utils/contentFetch';
import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { Emojis } from '../../Utils/emojis';

export interface CommandArgs {
  query: string;
}

export const commandName = 'docs';

export class Docs extends BaseInteractionCommandOption {
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
            return await ctx.respond({ choices: choices });
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

  async run(ctx: InteractionContext, args: CommandArgs) {
    const DATA = await fetchContent(process.env.docsUrl as string);
    if (!ctx.options) return;
    const query = args.query;
    if (!query)
      return await ctx.editOrRespond({
        content: `${Emojis.warning} Please provide a query.`,
      });
    const [name, link] = (query as string).split('~');
    if (!link) {
      findAndSend(ctx, name, DATA, true, 8);
      return;
    }
    ctx.editOrRespond({
      content: `**[${name}](${DATA.baseLink}${link})**`,
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
  const messages = new Array<any>();
  const parsed = isParsed ? [{ name: queryStr }] : parseMessage(queryStr);
  const links: Array<ExtraSearchData> = [];
  const otherPossibilities = [];
  if (parsed && parsed.length) {
    for (const query of parsed) {
      const item = findInData(query, DATA, {
        highlight: '',
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
      if (channel instanceof InteractionContext) {
        channel.editOrRespond({
          content: `${Emojis.warning} I could not find anything about the argument you have entered.`,
        });
      } else {
        await channel.message.react('❌').catch((e) => {
          false;
        });
      }
      return;
    }

    const fullComments: string[] = [];

    for (let i of [...links, ...otherPossibilities]) {
      if (!i.obj.comment) continue;
      const text = await fetch(i.fullLink).then((x) => x.text());
      let uwu = text.split('<p>')[2].split('</p>')[0];
      uwu = decode(uwu);
      uwu = uwu.replace(
        /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/gi,
        (nose) => '`' + nose.split('</code>')[0].split('<code>')[1] + '`',
      );
      fullComments.push(uwu);
    }

    messages.push(
      links
        .map(
          (link, index) =>
            `**[${link.highlighted || link.obj.name}](${link.fullLink})**${
              link.obj.comment
                ? `\n> ${(fullComments[index] || link.obj.comment).replace(
                    /(\r\n|\n|\r)/gm,
                    ', ',
                  )}.`
                : ''
            }`,
        )
        .join('\n'),
    );

    if (otherPossibilities.length) {
      messages.push(
        `\`Other results:\`\n${
          otherPossibilities.length
            ? otherPossibilities
                .map(
                  (link) =>
                    `**[${link.highlighted || link.obj.name}](${
                      link.fullLink
                    })**${
                      link.obj.comment
                        ? `\n> ${link.obj.comment.replace(
                            /(\r\n|\n|\r)/gm,
                            ', ',
                          )}.`
                        : ''
                    }`,
                )
                .join('\n')
            : 'None'
        }`,
      );
    }
    if (channel instanceof InteractionContext) {
      await channel.editOrRespond({ content: messages.join('\n\n') });
    } else {
      await channel.message.client.rest.createMessage(
        channel.message.channelId,
        {
          content: messages.join('\n\n'),
        },
      );
    }
  }
}
