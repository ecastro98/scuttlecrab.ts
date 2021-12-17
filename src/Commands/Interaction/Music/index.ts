import { BaseSlashCommand } from '../../../Classes/BaseInteractionCommand';
import { Play } from './play';

export default class MusicGroupCommand extends BaseSlashCommand {
  description = 'A group of Music commands.';
  name = 'music';

  constructor() {
    super({
      options: [new Play()],
    });
  }
}
