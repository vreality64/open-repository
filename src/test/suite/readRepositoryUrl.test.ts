import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';

import { readRepositoryUrl } from '../utils/readRepositoryUrl';

suite(`readRepositoryUrl - from package json object`, () => {
	before(() => {
		vscode.window.showInformationMessage('Start readRepositoryUrl tests.');
	});

	after(() => {
		vscode.window.showInformationMessage('All readRepositoryUrl tests done!');
	});

	test(`read repository url from object`, () => {
    const repository = {
      type: 'git',
      url: 'https://github.com/foo/bar.git'
    };

		assert.strictEqual(readRepositoryUrl(repository), 'https://github.com/foo/bar.git');
	});

	test(`read repository url from shortcut string`, () => {
		assert.strictEqual(readRepositoryUrl(`npm/npm`), `https://npm.com/npm/npm`);
		assert.strictEqual(readRepositoryUrl(`github:user/repo`), `https://github.com/user/repo`);
		assert.strictEqual(readRepositoryUrl(`gist:11081aaa281`), `https://gist.github.com/11081aaa281`);
		assert.strictEqual(readRepositoryUrl(`bitbucket:user/repo`), `https://bitbucket.org/user/repo`);
		assert.strictEqual(readRepositoryUrl(`gitlab:user/repo`), `https://gitlab.com/user/repo`);
	});

	test(`read repository url with directory subpath`, () => {
		const repository = {
      type: 'git',
      url: 'https://github.com/foo/bar.git',
			directory: 'packages/something',
    };

		assert.strictEqual(readRepositoryUrl(repository), 'https://github.com/foo/bar/tree/master/packages/something');
	});
});
