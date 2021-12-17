import BaseCollector, { CollectorOptions } from './base.js';
import detritus from 'detritus-client';

class MessageCollector extends BaseCollector {
  options!: CollectorOptions<detritus.Structures.Message>;
  channel: undefined | detritus.Structures.ChannelBase;

  constructor(
    channel: detritus.Structures.ChannelBase,
    options: CollectorOptions<detritus.Structures.Message>,
    shardClient: detritus.ShardClient,
  ) {
    super(options, shardClient);
    this.channel = channel;
    const sub = shardClient.subscribe('messageCreate', (data) =>
      this.handleMessageCreate(data),
    );
    this.once('end', () => {
      sub.remove();
    });
  }

  async handleMessageCreate(
    payload: detritus.GatewayClientEvents.MessageCreate,
  ) {
    if (!this.running) return false;
    if (!payload.message) return false;
    if (this.channel?.id != payload.message.channelId) return;

    const resFilter = await this.options.filter(payload.message);

    if (!resFilter) return;

    if (++this.usages == this.options.max) {
      this.emit('collect', payload.message);
      this.stop('max');
    } else {
      if (this.options.timeIdle) {
        clearTimeout(this._idleTimeout);
        this._idleTimeout = setTimeout(
          () => this.stop('idle'),
          this.options.timeIdle,
        );
      }

      this.emit('collect', payload.message);
    }

    return true;
  }

  on(event: 'end', listener: (reason: string) => void): this;
  on(
    event: 'collect',
    listener: (message: detritus.Structures.Message) => void,
  ): this;
  on(event: 'end' | 'collect', listener: (...args: any[]) => void) {
    super.on(event, listener);
    return this;
  }

  emit(event: 'end', ...args: any[]): boolean;
  emit(event: 'collect', args: detritus.Structures.Message): boolean;
  emit(event: 'end' | 'collect', ...args: any[]) {
    return super.emit(event, ...args);
  }

  get channelId() {
    return this.channel?.id;
  }

  get guildId() {
    return this.channel?.guildId;
  }
}

export default MessageCollector;
