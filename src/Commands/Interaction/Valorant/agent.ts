import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { BaseInteractionCommandOption } from '../../../Classes/BaseInteractionCommand';
import { Agents, CommandTypes, EmbedColors } from '../../../Utils/constants';
import { getAgent } from 'valorant-fetch';
import { Emojis } from '../../../Utils/emojis';
import { Embed } from 'detritus-client/lib/utils';
import { bold, codestring, underline } from 'detritus-client/lib/utils/markup';
import { capitalize } from '../../../Utils/functions';

export interface CommandArgs {
  agent: string;
}

export const commandName = 'agent';

export class Agent extends BaseInteractionCommandOption {
  constructor() {
    super({
      name: commandName,
      description: 'Get information about a valorant agent.',
      metadata: {
        description: 'Get information about a valorant agent.',
        examples: [commandName],
        type: CommandTypes.VALORANT,
        usage: `${commandName} <agent: Agent Name>`,
        onlyDevs: false,
        nsfw: false,
      },
      options: [
        {
          name: 'agent',
          description: 'The agent to get information about.',
          type: ApplicationCommandOptionTypes.STRING,
          required: true,
          choices: Agents,
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

  async run(ctx: InteractionContext, { agent }: CommandArgs) {
    const agentData = getAgent(agent);
    if (!agentData) {
      return await ctx.editOrRespond({
        content: `${Emojis.WARNING} Unknown agent.`,
      });
    }

    if (agentData) {
      const embed = new Embed()
        .setColor(EmbedColors.DEFAULT)
        .setTitle(underline(`${agentData.name}`))
        .setThumbnail(agentData.photos.icon);

      if (agentData.biography) {
        embed.addField(underline('Story'), agentData.biography.story);
      }

      if (agentData.biography.agent_about) {
        embed.addField(underline('About'), agentData.biography.agent_about);
      }

      if (agentData.biography.region) {
        embed.addField(
          underline('Origin'),
          agentData.biography.region.join(', '),
        );
      }

      if (agentData.stats) {
        const arrray_stats = [
          `${codestring('Q:')} ${capitalize(agentData.stats.Q.toLowerCase())}.`,
          `${codestring('E:')} ${capitalize(agentData.stats.E.toLowerCase())}.`,
          `${codestring('C:')} ${capitalize(
            agentData.stats.C.toLowerCase(),
          )}  - ${bold('Signature')}.`,
          `${codestring('X:')} ${capitalize(
            agentData.stats.Q.toLowerCase(),
          )} - ${bold('Ultimate')}.`,
        ];
        embed.addField(
          underline('Abilities Stats'),
          arrray_stats.join('\n'),
          true,
        );
      }

      if (agentData.tags.length) {
        embed.addField(
          underline('Tags'),
          agentData.tags
            .map((value) => capitalize(value.toLowerCase()))
            .join(', '),
          true,
        );
      }

      return await ctx.editOrRespond({ embeds: [embed] });
    }
  }
}
