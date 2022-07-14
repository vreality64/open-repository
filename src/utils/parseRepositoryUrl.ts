export function parseRepositoryUrl(url: string) {
  try {
    const { protocol, href } = new URL(url.replace(/.git$/, ''));

    return href.replace(protocol, 'https:');
  } catch (error) {}

  return null;
}