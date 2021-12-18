import { BaseSlashCommand } from '../../../Classes/BaseInteractionCommand';
import { NowPlaying } from './nowplaying';
import { Pause } from './pause';
import { Play } from './play';
import { Resume } from './resume';
import { Stop } from './stop';

export default class MusicGroupCommand extends BaseSlashCommand {
  description = 'A group of Music commands.';
  name = 'music';

  constructor() {
    super({
      options: [
        new Play(),
        new Stop(),
        new Pause(),
        new Resume(),
        new NowPlaying(),
      ],
    });
  }
}
