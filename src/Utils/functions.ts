import { Context } from 'detritus-client/lib/command';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { codestring } from 'detritus-client/lib/utils/markup';
import { Role } from './constants';

export function getAvatar(
  user: any,
  type: string = 'png',
  size: number = 512,
): string {
  if ('user' in user) {
    return getAvatar(user.user, type, size);
  } else {
    if (user.avatar !== null)
      return `https://cdn.discordapp.com/avatars/${user.id as string}/${
        user.avatar as string
      }.${type}?size=${size}`;
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

  if (!args[1]) return undefined;

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
    let path: any;
    let member: any;
    if (name.includes('/')) {
      path = name.split('/');
      name = path.pop() as string;
    }
    if (name.includes('.')) {
      const [newName, newMember] = name.split('.');
      name = newName;
      member = newMember;
    }
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
        .map((cmd) => (codeString ? codestring(cmd.name) : cmd.name))
        .join(join);
      return map_prefixed_commands;

    case 'interaction':
      const filter_interaction_category =
        ctx.interactionCommandClient!.commands.filter(
          (cmd) => cmd.metadata.type === category,
        );
      const map_interaction_commands = filter_interaction_category
        .map((cmd) => (codeString ? codestring(cmd.name) : cmd.name))
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

export function getRandomObjectKey(obj: any) {
  const keys = Object.keys(obj);
  return keys[(keys.length * Math.random()) << 0];
}

export function getRandomArrayElement(arr: Array<any>) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function arraysAreEquivalent(arr1: Array<any>, arr2: Array<any>) {
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
