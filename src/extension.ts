import { window, ExtensionContext, commands, env, workspace, Uri, TerminalOptions, Terminal, ProgressLocation  } from 'vscode';
import { withDelay } from './utils/delay';
import { isEmptyStringOrNil } from './utils/validator';

const EXTENSION_NAME = `open-repository`;
const GROUP = `[Open Repository] `;

export function activate(context: ExtensionContext) {
  console.log(`${GROUP} start initialize open-repository extension`);

  const open = commands.registerCommand('open-repository.openRepository', async () => {
    const query = await window.showInputBox({ placeHolder: `@facebook/react`, prompt: `Enter package name` });

    if (isEmptyStringOrNil(query)) {
      return;
    }

    const command = `npm repo ${query}`;
    const terminal = getTerminal({ name: EXTENSION_NAME });

    terminal.sendText(command);

    // NOTE: dummy progress, there is no way to handle terminal output
    window.withProgress({ title: `${GROUP} opening repository...`, location: ProgressLocation.Notification }, withDelay(5000));
  });

  context.subscriptions.push(open);

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
