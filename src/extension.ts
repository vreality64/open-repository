import { window, ExtensionContext, commands, env, workspace, Uri, TerminalOptions, Terminal, ProgressLocation  } from 'vscode';
import { withDelay } from './utils/delay';
import { isEmptyStringOrNil } from './utils/validator';

const EXTENSION_NAME = `open-repository`;
const GROUP = `[Open Repository] `;
// NOTE: wait for a while until shell command finished
const WAIT_TIME = 5000;

export function activate(context: ExtensionContext) {
  console.log(`${GROUP} start initialize open-repository extension`);

  const open = commands.registerCommand('open-repository.openRepository', async () => {
    const query = await window.showInputBox({ placeHolder: `react`, prompt: `Enter package name` });

    if (isEmptyStringOrNil(query)) {
      return;
    }

    try {
      await openRepository(query);
    } catch(error) {
      window.showErrorMessage(`${GROUP} fail to open repository, check repository information in package.json`);
    }
  });

  const openFromSelection = commands.registerTextEditorCommand('open-repository.openRepositoryFromSelection', async (editor) => {
    const query = editor?.document.getText(editor.selection);

    if (isEmptyStringOrNil(query)) {
      return;
    }

    try {
      await openRepository(query);
    } catch(error) {
      window.showErrorMessage(`${GROUP} fail to open repository, check repository information in package.json`);
    }
  });

  context.subscriptions.push(open, openFromSelection);

  console.log(`${GROUP} open-repository initialized successfully`);
}

export function deactivate() {
  const activeTerminal = findTerminal(EXTENSION_NAME);

  if (activeTerminal) {
    activeTerminal.dispose();
  }
}

function findTerminal(name?: string) {
  if (isEmptyStringOrNil(name)) {
    return undefined;
  }

  return window.terminals.find(terminal => terminal.name === name);
}

function getTerminal(options: TerminalOptions) {
  const activeTerminal = findTerminal(options.name);

  if (activeTerminal) {
    return activeTerminal;
  }

  return window.createTerminal({
    ...options,
    hideFromUser: true,
  });
}

async function openRepository(query: string) {
  const command = `npm repo ${query}`;
  const terminal = getTerminal({ name: EXTENSION_NAME });
  const backup = await env.clipboard.readText();

  terminal.sendText(command);
  terminal.sendText(`
  if [ $? -eq 0 ]
  then
    echo "success" | pbcopy
  else
    echo "fail" | pbcopy
  fi
  `);

  await window.withProgress({
    title: `${GROUP} trying to open repository '${query}'`,
    location: ProgressLocation.Notification
  }, withDelay(WAIT_TIME));

  const result = await env.clipboard.readText();

  await env.clipboard.writeText(backup);

  terminal.dispose();

  return /success/.test(result) ? Promise.resolve() : Promise.reject();
}