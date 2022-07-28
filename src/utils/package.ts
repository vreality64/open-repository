// NOTE: package json v8 is only support ESM, however vscode extension does not.
const packageJson: any = require('package-json');

const fs = require('fs');
const path = require('path');

import { fromUrl } from 'hosted-git-info';
import { isEmptyStringOrNil } from './validator';
import { template } from './template';

import { resolveDirectoryContext, INpmPackage as Package } from '@wixc3/resolve-directory-context';

type Repository = {
  type: string;
  url?: string;
  directory?: string;
} | string;

export async function getRepositoryUrl(repository?: Repository) {
  const url = typeof repository === 'string' ? repository : repository?.url ?? '';
  const directory = typeof repository !== 'string' ? repository?.directory : undefined;

  try {
    // case 1: read hosted repository from package json
    const info = fromUrl(url?.replace(/^git\+/, ''))!;
    const parsed = typeof directory === 'string' ? info.browse(directory) : info.browse();

    return parsed;
  } catch (error) {}

  // case 2: read enterprise repository from package json
  try {
    const base = parseRepositoryUrl(url);

    if (isEmptyStringOrNil(base)) {
      return null;
    }

    return template({
      base,
      path: directory,
      treepath: 'tree',
      branch: 'master',
    });
  } catch (error) {}

  // case 3: unhandled repository
  return null;
}

/**
 * read from npm registry
 *
 * @param packageName
 * @returns
 */
export async function readFromRegistry(packageName: string) {
  try {
    const metadata = await packageJson(packageName, { fullMetadata: true });

    return metadata;
  } catch (error) {}

  return {};
}

/**
 * read from installed yarn monorepo metadata
 *
 * @param packageName
 * @returns
 */
export async function readFromInstalledMetadata(packageName: string, cwd: string) {
  const context = resolveDirectoryContext(cwd,  { ...fs, ...path });
  const pkg = findPackage(packageName, {
    packages: context.type === 'multi' ?  context.packages : [context.npmPackage]
  });

  return pkg?.packageJson;
}

function findPackage(packageName: string, options: { packages: Package[] }) {
  return options.packages.find(pkg => pkg.displayName === packageName);
}

export function parseRepositoryUrl(url: string) {
  try {
    const { protocol, href } = new URL(url.replace(/.git$/, ''));

    return href.replace(protocol, 'https:');
  } catch (error) {}

  return null;
}
