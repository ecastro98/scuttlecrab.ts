import { BaseSlashCommand } from '../../../Classes/BaseInteractionCommand';
import { Agent } from './agent';
import { Map } from './map';

export default class ValorantGroupCommand extends BaseSlashCommand {
  description = 'A group of Valorant commands.';
  name = 'valorant';

  constructor() {
    super({
      options: [new Agent(), new Map()],
    });
  }
}
