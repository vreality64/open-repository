import * as assert from 'assert';

import { template } from '../../utils/template';

suite(`template - combine url of repository`, () => {
  test(`github enterprise url`, () => {
    const actual = template({
      base: 'https://github.enterprise.com/foo/bar',
      branch: 'main',
      treepath: 'tree',
    });
    const expected = `https://github.enterprise.com/foo/bar/tree/main`;

    assert.strictEqual(actual, expected);
  });

  test(`with sub directory`, () => {
    const actual = template({
      base: 'https://github.enterprise.com/foo/bar',
      branch: 'main',
      treepath: 'tree',
      path: 'packages/monorepo',
    });
    const expected = `https://github.enterprise.com/foo/bar/tree/main/packages/monorepo`;

    assert.strictEqual(actual, expected);
  });
});