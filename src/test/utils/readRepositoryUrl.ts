import { StringKeyOf } from 'type-fest';

interface RepositoryRecord {
  type?: string;
  url?: string;
  directory?: string;
}

type RepositoryShortcut = string;

type Repository = RepositoryRecord | RepositoryShortcut;

export function readRepositoryUrl(repository: Repository) {
  if (typeof repository === 'string') {
    return parseShortcutRepository(repository).url;
  }

  const { url, directory } = repository;

  return `${url}`;
}

const shortcutSyntax = {
  'npm': 'https://npm.com/',
  'github': 'https://github.com/',
  'gist': 'https://gist.github.com/',
  'bitbucket': 'https://bitbucket.org/',
  'gitlab': 'https://gitlab.com/',
} as const;

type ShortcutKey = StringKeyOf<typeof shortcutSyntax>;

const shortcutKeys = Object.keys(shortcutSyntax) as Array<ShortcutKey>;

function parseShortcutRepository(repository: RepositoryShortcut) {
  const shortcut = shortcutKeys.find(key => repository.startsWith(key));

  if (!!shortcut) {
    const base = shortcutSyntax[shortcut];

    // NOTE: shortcut is npm, then re-use repository all of it. else use repository after ':' symbol.
    if (shortcut === 'npm') {
      return { shortcut, url: `${base}/${repository}` };
    }

    const delimiterIndex = repository.indexOf(':');
    const subpath = repository.slice(delimiterIndex + 1);

    return { shortcut, url: `${base}/${subpath}` };
  }

  throw new Error(`[Open Repository] it's not supported shortcut `);
}