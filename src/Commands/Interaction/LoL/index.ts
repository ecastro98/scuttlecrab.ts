import { BaseSlashCommand } from '../../../Classes/BaseInteractionCommand';
import { Profile } from './profile';
import { Current } from './current';

export default class LoLGroupCommand extends BaseSlashCommand {
  description = 'A group of League of Legends commands.';
  name = 'lol';

  constructor() {
    super({
      options: [new Profile(), new Current()],
    });
  }
}