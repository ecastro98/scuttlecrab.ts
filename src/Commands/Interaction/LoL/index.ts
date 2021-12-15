import { BaseSlashCommand } from '../../../Classes/BaseInteractionCommand';
import { Profile } from './profile';
import { Current } from './current';
import { Live } from './live';
import { Add } from './add';

export default class LoLGroupCommand extends BaseSlashCommand {
  description = 'A group of League of Legends commands.';
  name = 'lol';

  constructor() {
    super({
      options: [new Profile(), new Current(), new Live(), new Add()],
    });
  }
}
