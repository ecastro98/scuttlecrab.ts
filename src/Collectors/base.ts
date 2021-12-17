import detritus from 'detritus-client';
import events from 'events';

export interface CollectorOptions<T = any> {
  max?: number;
  timeIdle?: number;
  timeLimit?: number;
  filter: (thing: T) => boolean | Promise<boolean>;
  events?: {
    messageDelete: boolean;
    messageDeleteBulk: boolean;
    guildDelete: boolean;
    channelDelete: boolean;
    threadDelete: boolean;
  };
}

class BaseCollector extends events.EventEmitter {
  shardClient: detritus.ShardClient;
  options: CollectorOptions;
  running: boolean;
  usages: number;
  _idleTimeout!: NodeJS.Timeout;
  _timeTimeout!: NodeJS.Timeout;

  constructor(options: CollectorOptions, shardClient: detritus.ShardClient) {
    options.events = {
      messageDelete: true,
      messageDeleteBulk: true,
      guildDelete: true,
      channelDelete: true,
      threadDelete: true,
      ...(options.events || {}),
    };
    super();
    this.shardClient = shardClient;
    this.options = options;
    this.running = true;
    this.incrementMaxListeners();
    this.usages = 0;
    if (options.timeLimit)
      this._timeTimeout = setTimeout(() => {
        this.stop('time');
      }, options.timeLimit);
    if (options.timeIdle)
      this._idleTimeout = setTimeout(() => {
        this.stop('idle');
      }, options.timeIdle);
    const subscriptions = {
      messageDelete: options.events?.messageDelete
        ? shardClient.subscribe('messageDelete', (d) =>
            this.handleMessageDelete(d),
          )
        : null,
      messageDeleteBulk: options.events?.messageDeleteBulk
        ? shardClient.subscribe('messageDeleteBulk', (d) =>
            this.handleMessageDeleteBulk(d),
          )
        : null,
      guildDelete: options.events?.guildDelete
        ? shardClient.subscribe('guildDelete', (d) => this.handleGuildDelete(d))
        : null,
      channelDelete: options.events?.channelDelete
        ? shardClient.subscribe('channelDelete', (d) =>
            this.handleChannelDelete(d),
          )
        : null,
      threadDelete: options.events?.threadDelete
        ? shardClient.subscribe('threadDelete', (d) =>
            this.handleThreadDelete(d),
          )
        : null,
    };

    this.once('end', () => {
      if (this.options.timeIdle) clearTimeout(this._idleTimeout);
      if (this.options.timeLimit) clearTimeout(this._timeTimeout);

      this.removeAllListeners();
      for (const sub of Object.values(subscriptions)) {
        if (sub) sub.remove();
      }
      this.decrementMaxListeners();
    });
  }

  handleMessageDelete(message: detritus.GatewayClientEvents.MessageDelete) {
    if (!this.messageId) return;

    if (message.messageId == this.messageId) this.stop('messageDelete');
  }

  handleMessageDeleteBulk({
    messages,
  }: detritus.GatewayClientEvents.MessageDeleteBulk) {
    if (!this.messageId) return;

    if (messages.some((item) => !!(item && item.id == this.messageId)))
      this.stop('messageDelete');
  }

  handleGuildDelete({ guild }: detritus.GatewayClientEvents.GuildDelete) {
    if (!this.guildId) return;

    if (guild?.id == this.guildId) this.stop('guildDelete');
  }

  handleChannelDelete({ channel }: detritus.GatewayClientEvents.ChannelDelete) {
    if (!this.channelId) return;

    if (channel.id == this.channelId) this.stop('channelDelete');
  }

  handleThreadDelete({ thread }: detritus.GatewayClientEvents.ThreadDelete) {
    if (this.channelId) return;

    if (thread?.id == this.channelId) this.stop('threadDelete');
  }

  stop(reason: string) {
    if (!this.running) return;
    this.emit('end', reason);
    this.running = false;
  }

  incrementMaxListeners() {
    const maxListeners = this.shardClient.getMaxListeners();
    if (maxListeners !== 0) {
      this.shardClient.setMaxListeners(maxListeners + 1);
    }
  }

  decrementMaxListeners() {
    const maxListeners = this.shardClient.getMaxListeners();
    if (maxListeners !== 0) {
      this.shardClient.setMaxListeners(maxListeners - 1);
    }
  }

  get channelId(): string | undefined {
    return '';
  }

  get messageId(): string | undefined {
    return '';
  }

  get guildId(): string | undefined {
    return '';
  }
}

export default BaseCollector;
