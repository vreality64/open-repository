import packageJson from 'package-json';
import { fromUrl } from 'hosted-git-info';
import { isEmptyStringOrNil } from './validator';
import { template } from './template';
import { parseRepositoryUrl } from './parseRepositoryUrl';

interface Repository {
  type: string;
  url?: string;
  directory?: string;
}

export async function getRepositoryUrl(repository?: Repository) {
  try {
    // case 1: read hosted repository from package json
    const info = fromUrl(repository!.url!.replace(/^git\+/, ''));
    const parsed = info!.browse(repository!.directory!);

    return parsed;
  } catch (error) {}

  // case 2: read enterprise repository from package json
  try {
    const base = parseRepositoryUrl(repository!.url!);

    if (isEmptyStringOrNil(base)) {
      return null;
    }

    return template({
      base,
      path: repository?.directory,
      treepath: 'tree',
      branch: 'master',
    });
  } catch (error) {}

  // case 3: unhandled repository
  return null;
}

export async function readPackageJson(packageName: string) {
  return packageJson(packageName, { fullMetadata: true });
}
