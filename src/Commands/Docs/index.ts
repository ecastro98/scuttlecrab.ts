import { BaseSlashCommand } from '../../Classes/BaseInteractionCommand';
import { Docs } from './docs';

export default class DetritusGroupCommand extends BaseSlashCommand {
  name = 'detritus';
  description = 'Commands for detritus-client.';

  constructor() {
    super({
      options: [new Docs()],
    });
  }
}
