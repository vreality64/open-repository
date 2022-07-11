import { window, ExtensionContext, commands, env, workspace, Uri,  } from 'vscode';
import { isEmptyArrayOrNil, isEmptyStringOrNil } from './utils/validator';
import { readRepositoryUrl, Repository } from './utils/readRepositoryUrl';

const GROUP = `[Open Repository] `;

export function activate(context: ExtensionContext) {
  console.log(`${GROUP} start initialize open-repository extension`);

  const open = commands.registerCommand('open-repository.openRepository', async () => {
    const query = await window.showInputBox({ placeHolder: `@facebook/react`, prompt: `Enter package name` });

    if (isEmptyStringOrNil(query)) {
      window.showWarningMessage(`${GROUP} package name is required`);

      return;
    }

    const target = `node_modules/${query}/package.json`;
    const files = await workspace.findFiles(target, `!node_modules/**/*`);

    if (isEmptyArrayOrNil(files)) {
      window.showWarningMessage(`${GROUP} installed package not found: typed -> ${query}`);

      return;
    }

    try {
      const packageJson = await readPackageJson<{ repository: Repository }>(files[0].path);
      const url = readRepositoryUrl(packageJson.repository);
      const repositoryUri = Uri.parse(url);

      const success = env.openExternal(repositoryUri);

      if (!success) {
        throw new Error();
      }
    } catch (error) {
      window.showErrorMessage(`${GROUP} cannot parse repository information in package.json`);
    }
  });

  context.subscriptions.push(open);

  console.log(`${GROUP} open-repository initialized successfully`);
}

// this method is called when your extension is deactivated
export function deactivate() {}

async function readPackageJson<Structure>(filePath: string) {
  const node = await workspace.openTextDocument(filePath);
  const text = node.getText();

  return JSON.parse(text) as Structure;
}