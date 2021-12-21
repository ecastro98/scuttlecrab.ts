import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import {
  ValorantMaps,
  CommandTypes,
  EmbedColors,
} from '../../../Utils/constants';
import { getMap } from 'valorant-fetch';
import { Emojis } from '../../../Utils/emojis';
import { Embed } from 'detritus-client/lib/utils';
import { underline } from 'detritus-client/lib/utils/markup';

export interface CommandArgs {
  map: string;
}

export const commandName = 'map';

export class Map extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Get information about a valorant map.',
      metadata: {
        description: 'Get information about a valorant map.',
        examples: [commandName],
        type: CommandTypes.VALORANT,
        usage: `${commandName} <map: Map Name>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'map',
          description: 'The map to get information about.',
          type: ApplicationCommandOptionTypes.STRING,
          required: true,
          choices: ValorantMaps,
        },
      ],
      ratelimits: [
        { duration: 3500, limit: 1, type: 'user' },
        { duration: 5500, limit: 5, type: 'channel' },
        { duration: 10000, limit: 10, type: 'guild' },
      ],
      disableDm: false,
    });
  }

  async run(ctx: InteractionContext, { map }: CommandArgs) {
    const mapData = getMap(map);

    if (!mapData) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} Unknown map.`,
      });
    }

    if (mapData) {
      const map_embed = new Embed()
        .setTitle(underline(mapData.name))
        .setColor(EmbedColors.DEFAULT)
        .setThumbnail(mapData.photos.minimap)
        .setImage(mapData.photos.screenshot_1);

      if (mapData.informations) {
        map_embed.setDescription(mapData.informations.about_map);
      }

      if (mapData.informations.coordinate) {
        map_embed.addField(
          underline('Coordinates'),
          `${mapData.informations.coordinate.join(', ')}.`,
        );
      }

      return await ctx.editOrRespond({
        embeds: [map_embed],
      });
    }
  }
}
