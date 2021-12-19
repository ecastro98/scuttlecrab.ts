import type { MemberOrUser } from 'detritus-client/lib/structures';
import { Context } from 'detritus-client/lib/command';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { bold, codestring } from 'detritus-client/lib/utils/markup';
import { QueueTypes, Role } from './constants';
import { Queue } from './types';

export function getAvatar(
  user: MemberOrUser,
  type: string = 'png',
  size: number = 512,
): string {
  if ('user' in user) {
    return getAvatar(user.user, type, size);
  } else {
    if (user.avatar !== null)
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${type}?size=${size}`;
    return `https://cdn.discordapp.com/embed/avatars/${
      Number(user.discriminator) % 5
    }.png`;
  }
}

export function fetchGuildMember(ctx: Context) {
  const msg = ctx.message;
  const args = msg.content
    .slice(ctx.prefix!.length + ctx.command!.name.length)
    .split(' ');

  if (!args[1]) return;

  const m =
    msg.mentions.first() ||
    msg.guild?.members.get(args[1]) ||
    msg.guild?.members.find(
      (m) => m.username.toLowerCase() === args[1].toLowerCase(),
    ) ||
    msg.guild?.members.find(
      (m) => m.nick?.toLowerCase() === args[1].toLowerCase(),
    );
  return m;
}

export function fetchUser(ctx: Context) {
  const msg = ctx.message;
  const args = msg.content
    .slice(ctx.prefix!.length + ctx.command!.name.length)
    .split(' ');

  if (!args[1]) return undefined;

  const m =
    ctx.client.users.get(msg.mentions.first()?.id || '') ||
    ctx.client.users.get(args[1]) ||
    ctx.client.users.find(
      (m) => m.username.toLowerCase() === args[1].toLowerCase(),
    );
  return m;
}

export interface MessageFinding {
  name: string;
  path?: Array<string>;
  member?: string;
  exact?: boolean;
}

export function parseMessage(msg: string): Array<MessageFinding> | undefined {
  let ind = msg.indexOf('[[');
  if (ind === -1) return;
  const findings: Array<MessageFinding> = [];
  for (; ind !== -1; ind = msg.indexOf('[[', ind)) {
    const end = msg.indexOf(']]', ind);
    let exact = false;
    if (end === -1) break;
    let name = msg.slice(ind + 2, end);
    if (name[0] === '~') {
      name = name.slice(1);
      exact = true;
    }
    let path: string[];
    let member: string;

    if (name.includes('/')) {
      path = name.split('/');
      name = path.pop()!;
    }
    if (name.includes('.')) {
      const [newName, newMember] = name.split('.');
      name = newName;
      member = newMember;
    }

    path ??= [];
    member ??= '';

    findings.push({ name, path, member, exact });
    ind = end;
  }
  return findings;
}

export function getCommands(
  ctx: Context | InteractionContext,
  category: string,
  type: string = 'prefixed',
  codeString: boolean = true,
  join: string = '\n',
): string | undefined {
  switch (type) {
    case 'prefixed':
      const filter_prefixed_category = ctx.commandClient!.commands.filter(
        (cmd) => cmd.metadata.type === category,
      );
      const map_prefixed_commands = filter_prefixed_category
        .map(
          (cmd) =>
            '  - ' +
            (codeString ? codestring(cmd.name) : cmd.name) +
            '   ' +
            cmd.metadata.description,
        )
        .join(join);
      return map_prefixed_commands;

    case 'interaction':
      const filter_interaction_category =
        ctx.interactionCommandClient!.commands.filter(
          (cmd) => cmd.metadata.type === category,
        );
      const map_interaction_commands = filter_interaction_category
        .map(
          (cmd) =>
            '  - ' +
            (codeString ? codestring(cmd.name) : cmd.name) +
            '   ' +
            cmd.description,
        )
        .join(join);
      return map_interaction_commands;
  }
}

export function getCommandInfo(
  ctx: Context | InteractionContext,
  name: string,
  type: string = 'prefixed',
) {
  switch (type) {
    case 'prefixed':
      const command = ctx.commandClient!.commands.find(
        (cmd) => cmd.name === name,
      );

      if (!command) return null;

      return {
        name: command?.name,
        category: capitalize(command?.metadata.type as string),
        metadata: command?.metadata,
        ratelimits: command?.ratelimits || [],
        permissions: command?.permissions || [],
        permissionsClient: command?.permissionsClient || [],
      };

    case 'interaction':
      const command_interaction = ctx.interactionCommandClient!.commands.find(
        (cmd) => cmd.name === name,
      );

      if (!command_interaction) return null;

      return {
        name: command_interaction?.name,
        category: capitalize(command_interaction?.metadata.type as string),
        metadata: command_interaction?.metadata,
        ratelimits: command_interaction?.ratelimits || [],
        permissions: command_interaction?.permissions || [],
        permissionsClient: command_interaction?.permissionsClient || [],
      };
  }
}

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function summonerIcon(patch: string, profileIconId: number) {
  return `http://ddragon.leagueoflegends.com/cdn/${patch}/img/profileicon/${profileIconId}.png`;
}

export function getRandomObjectKey(obj: Object) {
  const keys = Object.keys(obj);
  return keys[(keys.length * Math.random()) << 0];
}

export function getRandomArrayElement<T = any>(arr: Array<T>) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function arraysAreEquivalent<T = any>(arr1: Array<T>, arr2: Array<T>) {
  if (arr1 === undefined || arr2 === undefined) {
    return false;
  }
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (const element of arr1) {
    if (arr2.indexOf(element) < 0) {
      return false;
    }
  }
  return true;
}

export function normalizeRole(role: string): Role | null {
  const roleUpper = role.toUpperCase();

  if (roleUpper === 'TOP') {
    return Role.TOP;
  }
  if (['MIDDLE', 'MID'].indexOf(roleUpper) >= 0) {
    return Role.MID;
  }
  if (['BOT', 'BOTTOM', 'ADC', 'ADCARRY'].indexOf(roleUpper) >= 0) {
    return Role.ADC;
  }
  if (['JUNGLE', 'JUNG', 'JNG', 'JG', 'FILL'].indexOf(roleUpper) >= 0) {
    return Role.JNG;
  }
  if (['SUPPORT', 'SUPP', 'SUP', 'SP', 'SUPT'].indexOf(roleUpper) >= 0) {
    return Role.SUP;
  }

  return null;
}

export function getQueueById(id: number): Queue | null {
  const find = QueueTypes.find((queue) => queue.queueId === id);
  return find ? find : null;
}

export function format(millis: number): string {
  var h = Math.floor(millis / 3600000),
    m = Math.floor(millis / 60000),
    s = ((millis % 60000) / 1000).toFixed(0);
  if (h < 1)
    return (
      (m < 10 ? '0' : '') +
      m +
      ':' +
      (Number(s) < 10 ? '0' : '') +
      s +
      ' | ' +
      Math.floor(millis / 1000)
    );
  else
    return (
      (h < 10 ? '0' : '') +
      h +
      ':' +
      (m < 10 ? '0' : '') +
      m +
      ':' +
      (Number(s) < 10 ? '0' : '') +
      s +
      ' | ' +
      Math.floor(millis / 1000)
    );
}

export function createProgressBar(current: number, total: number, max: number) {
  const percentage = current / total;
  const percentageText = Math.round(percentage * 100);
  const progress = Math.round(max * (current / total));
  const remain = max - progress;
  return `[${[
    '▬'.repeat(progress),
    '<a:CDLogo:921611820421242972>',
    '▬'.repeat(remain),
  ].join('')}] | ${bold(`${percentageText}%`)}.`;
}

export function removeDuplicates(arr: Array<any>) {
  return arr.filter((elem, index, self) => index === self.indexOf(elem));
}

export function removeMarkdown(str: string) {
  str = str.replace(/`/g, '\\`');
  str = str.replace(/\*/g, '\\*');
  str = str.replace(/\_/g, '\\_');
  str = str.replace(/\|/, '\\|');
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  return str;
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomString(length: number = 10) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function getRandomColorHex() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function isHexColor(color: string) {
  return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
}

export function apiImages(str: string) {
  return `https://process.filestackapi.com/AhTgLagciQByzXpFGRI0Az/output=format:png/${str}`;
}

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
