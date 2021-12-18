import { BaseSlashCommand } from '../../../Classes/BaseInteractionCommand';
import { Avatar } from './avatar';
import { Ping } from './ping';
import { FetchInvite } from './fetch-invite';

export default class MiscGroupCommand extends BaseSlashCommand {
  name = 'misc';
  description = 'Other commands';

  constructor() {
    super({
      options: [new Avatar(), new Ping(), new FetchInvite()],
    });
  }
}
