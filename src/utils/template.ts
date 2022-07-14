function encode(params: string) {
  return encodeURIComponent(params);
}

interface Options {
  base: string;
  path?: string;
  treepath: string;
  branch: string;
}

export function template({ base, branch, treepath, path }: Options) {
  return [base, treepath, encode(branch), path].filter(Boolean).join('/');
}