import type { MemberOrUser } from 'detritus-client/lib/structures';
import { Context } from 'detritus-client/lib/command';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { bold, codestring } from 'detritus-client/lib/utils/markup';
import { QueueTypes, Role } from './constants';
import { Build, Queue } from './types';
import axios from 'axios';
import cheerio from 'cheerio';
import { RedisClient } from '../Cache';

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

const Spells = [
  'Heal',
  'Ghost',
  'Barrier',
  'Exhaust',
  'Mark',
  'Dash',
  'Clarity',
  'Flash',
  'Teleport',
  'Smite',
  'Cleanse',
  'Ignite',
];

const lanes: any = {
  top: 'top',
  mid: 'middle',
  jungle: 'jungle',
  adc: 'adc',
  support: 'support',
  '': '',
};

export async function getBuildsAndRunes(
  champion: string,
  role: string,
): Promise<Build[] | undefined> {
  try {
    const get = await RedisClient.get(
      `champBuild:${champion.toLowerCase()}_${role.toLowerCase()}`,
    );
    if (get) {
      return JSON.parse(get);
    }

    const ArrayData: Build[] = new Array();
    // if (!Object.keys(lanes).includes(role)) return;
    const link = `https://www.leagueofgraphs.com/champions/builds/${champion.toLowerCase()}/${role}`;
    const resNew = await axios.get(link);
    const a = cheerio.load(resNew.data);

    const runesPrimary = a('img', 'div[style=""]')
      .toArray()
      .map((rune) => a(rune).attr().alt)
      .slice(0, 4);

    const runesSecondary = a('img', 'div[style=""]')
      .toArray()
      .map((rune) => a(rune).attr().alt)
      .slice(4, 6);

    const runesShard = a('img', 'div[style=""]')
      .toArray()
      .map((rune) => a(rune).attr().alt)
      .slice(6, 9);

    const items = [
      ...new Set(
        a('img[width="48"]', 'div.championSpell')
          .toArray()
          .map((item, index) =>
            index > 5 && index < 13 ? a(item).attr().alt : '',
          )
          .filter((item) => !!item),
      ),
    ];

    const spells = a('img[width="48"]', 'div.championSpell')
      .toArray()
      .map((spell) => a(spell).attr().alt)
      .filter((spell) => Spells.includes(spell));

    ArrayData.push({
      runesPrimary: runesPrimary,
      runesSecondary: runesSecondary,
      runesShard: runesShard,
      items: items,
      spells: spells,
    });

    await RedisClient.set(
      `champBuild:${champion.toLowerCase()}_${role.toLowerCase()}`,
      JSON.stringify(ArrayData),
    );

    return ArrayData;
  } catch (error) {
    console.log((error as Error).message);
  }
}

export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatTime(time: number) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  return `${hours < 10 ? '0' + hours : hours}:${
    minutes < 10 ? '0' + minutes : minutes
  }:${seconds < 10 ? '0' + seconds : seconds}`;
}

export async function redisPingMS() {
  const start = Date.now();
  await RedisClient.ping();
  return Date.now() - start;
}

export async function fetchLoLItems() {
  const get = await RedisClient.get('items');
  if (get) {
    return JSON.parse(get);
  }

  const res = await axios.get(
    'https://ddragon.leagueoflegends.com/api/versions.json',
  );

  const fetch = await axios.get(
    `https://ddragon.leagueoflegends.com/cdn/${res.data[0]}/data/en_US/item.json`,
  );

  await RedisClient.set('items', JSON.stringify(fetch.data.data));

  return fetch.data.data;
}

export async function getItemID(name: string): Promise<number> {
  const items = await fetchLoLItems();
  const item: any = Object.values(items).find(
    (item: any) => item.name === name,
  );
  // if (!item) return null;

  return Number(item.image.full.split('.')[0]);
}

// async function graphicBar(
//   data: {
//     name: string;
//     value: number;
//   }[],
//   title: string,
//   color: string,
//   width: number,
//   height: number,
//   fontSize: number,
//   backgroundColor: string,
//   barColor: string,
//   barWidth: number,
// ) {
//   const canvas = createCanvas(width, height);
//   const ctx = canvas.getContext('2d');

//   ctx.fillStyle = backgroundColor;
//   ctx.fillRect(0, 0, width, height);

//   const barHeight = height / data.length;

//   data.forEach((item, index) => {
//     ctx.fillStyle = barColor;
//     ctx.fillRect(0, barHeight * index, (item.value / 100) * width, barHeight);

//     ctx.fillStyle = '#fff';
//     ctx.font = `${fontSize}px Arial`;
//     ctx.fillText(
//       item.name,
//       (item.value / 100) * width + 10,
//       barHeight * index + fontSize / 2,
//     );
//   });

//   ctx.fillStyle = color;
//   ctx.font = `${fontSize}px Arial`;
//   ctx.fillText(title, 10, fontSize);

//   return canvas.toBuffer();
// }
