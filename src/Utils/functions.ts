import { Context } from 'detritus-client/lib/command';

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
