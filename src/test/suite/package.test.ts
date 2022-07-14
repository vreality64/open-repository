import * as assert from 'assert';

import { parseRepositoryUrl } from '../../utils/package';

suite(`package utils`, () => {
  test(`success - allowed protocols`, () => {
    const protocols = ['git', 'ssh', 'git+ssh', 'git+http', 'git+https'];
    const urls = protocols.map(protocol => `${protocol}://github.enterprise.com/foo/bar.git`);
    const expected = `https://github.enterprise.com/foo/bar`;

    urls.forEach(url => {
      assert.strictEqual(parseRepositoryUrl(url), expected);
    });
  });

  test(`fail - unsupported urls`, () => {
    const url = `git@github.enterprise.com:foo/bar`;

    assert.strictEqual(parseRepositoryUrl(url), null);
  });
});