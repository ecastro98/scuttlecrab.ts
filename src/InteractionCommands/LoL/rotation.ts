import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommand } from '../../Classes/BaseInteractionCommand';
import { CommandTypes, EmbedColors } from '../../Utils/constants';
import { ChampionEmojis } from '../../Utils/emojis';
import { underline } from 'detritus-client/lib/utils/markup';
import { InteractionCallbackTypes } from 'detritus-client/lib/constants';
import { Embed } from 'detritus-client/lib/utils';
import axios from 'axios';

export const commandName = 'current';

export default class Current extends BaseInteractionCommand {
  constructor() {
    super({
      name: commandName,
      description: 'Information about the current patch.',
      metadata: {
        description: 'Information about the current patch.',
        examples: [commandName],
        type: CommandTypes.LOL,
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
    if (this.current.length > 0) {
      return await ctx.editOrRespond({
        embeds: [this.current[0]],
      });
    }

    await ctx.respond({
      type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });

    const response = await axios.get(
      `https://la1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${process.env.RIOT_API_TOKEN}`,
    );

    const freeWeekIds = response.data.freeChampionIds;
    const championsResponse = await axios.get(
      'http://ddragon.leagueoflegends.com/cdn/11.24.1/data/en_US/champion.json',
    );

    const championsInfo = Object.values(championsResponse.data.data);
    const getChampionInfo: any = (id: any) => {
      return championsInfo.find((champion: any) => champion.key === String(id));
    };

    const arr: any = [];
    let pos = 0;
    for (const freeId of freeWeekIds) {
      if (!Array.isArray(arr[pos])) arr[pos] = [];
      arr[pos].push(freeId);
    }

    for (const ids of arr) {
      const champions = ids
        .map((id: any) => ({ id, ...getChampionInfo(id) }))
        .filter((x: any) => !!x.name);

      const embed = new Embed()
        .setColor(EmbedColors.DEFAULT)
        .setTitle(`Patch ${underline('11.24')} Notes`)
        .setDescription(
          [
            'We cordially invite you to an exquisite, green tie Debonair affair to celebrate the end of the year!',
            '\u200B',
            "We're keeping it classy this week with sophisticated champion, item, rune, and dragon updates to keep preseason running splendidly. Ultimate Spellbook is also getting a spiffy update, and ARAM players worry not—we have some swanky news for you, too. So get your flashiest outfits ready to greet the new year in glitz and glam! It'll be just grand.",
            '\u200B',
            '\u200B',
            "Debonair dress code too strict for ya? Head over to the [TFT patch notes](https://www.leagueoflegends.com/en-us/news/game-updates/teamfight-tactics-patch-11-24-notes/) where the Little Legends won't Debo-care what you wear!",
            '\u200B',
            '- Jina "ahrisoo" Yoon.',
            '- Paul "RiotAether" Perscheid.',
            '<t:1638902967:R>',
          ].join('\n'),
        )
        .addField(
          underline('Free champions'),
          `${champions.map((x: any) => ChampionEmojis[x.name]).join('')}.`,
        )
        .setImage(
          'https://cdn.discordapp.com/attachments/915654347394777161/917981058396467221/120721_LOL1124Infographic_Image_v2.png',
        )
        .setFooter(
          `Requested by ${ctx.user.tag}.`,
          ctx.user.avatarUrlFormat(null, { size: 512 }),
        );

      this.current.push(embed);
      return await ctx.editOrRespond({
        embeds: [embed],
      });
    }
  }
}
