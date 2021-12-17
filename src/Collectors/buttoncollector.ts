import BaseCollector, { CollectorOptions } from './base.js';
import detritus from 'detritus-client';

export interface INTERACTION extends detritus.Structures.Interaction {
  data: detritus.Structures.InteractionDataComponent;
}

class ButtonCollector extends BaseCollector {
  options!: CollectorOptions<INTERACTION>;
  message: undefined | detritus.Structures.Message;

  constructor(
    message: detritus.Structures.Message,
    options: CollectorOptions<INTERACTION>,
    shardClient: detritus.ShardClient,
  ) {
    super(options, shardClient);
    this.message = message;
    const sub = shardClient.subscribe('interactionCreate', (data) =>
      this.handleInteractionCreate(data),
    );
    this.once('end', () => {
      sub.remove();
    });
  }

  async handleInteractionCreate(
    payload: detritus.GatewayClientEvents.InteractionCreate,
  ) {
    if (!this.running) return false;
    if (!payload.interaction.data) return;
    if (!('customId' in payload.interaction.data)) return false;

    if (this.message?.id != payload.interaction.message?.id) return;

    const resFilter = await this.options.filter(
      payload.interaction as INTERACTION,
    );

    if (!resFilter) return;

    if (++this.usages == this.options.max) {
      this.emit('collect', payload.interaction as INTERACTION);
      this.stop('max');
    } else {
      if (this.options.timeIdle) {
        clearTimeout(this._idleTimeout);
        this._idleTimeout = setTimeout(
          () => this.stop('idle'),
          this.options.timeIdle,
        );
      }

      this.emit('collect', payload.interaction as INTERACTION);
    }

    return true;
  }

  on(event: 'end', listener: (reason: string) => void): this;
  on(event: 'collect', listener: (interaction: INTERACTION) => void): this;
  on(event: 'end' | 'collect', listener: (...args: any[]) => void) {
    super.on(event, listener);
    return this;
  }

  emit(event: 'end', ...args: any[]): boolean;
  emit(event: 'collect', args: INTERACTION): boolean;
  emit(event: 'end' | 'collect', ...args: any[]) {
    return super.emit(event, ...args);
  }

  get channelId() {
    return this.message?.channelId;
  }

  get messageId() {
    return this.message?.id;
  }

  get guildId() {
    return this.message?.guildId;
  }
}

export default ButtonCollector;
