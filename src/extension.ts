import { window, ExtensionContext, commands, env, TerminalOptions, ProgressLocation, Terminal, Progress, CancellationTokenSource, CancellationError, CancellationToken, workspace, MessageItem, Uri } from 'vscode';
import { delay, withDelay } from './utils/delay';
import { isEmptyStringOrNil } from './utils/validator';

const EXTENSION_NAME = `open-repository`;
const GROUP = `[Open Repository] `;
// NOTE: wait for a while until shell command finished
const INTERVAL = 1000;
const TIMEOUT = 10000;

export function activate(context: ExtensionContext) {
  console.log(`${GROUP} start initialize open-repository extension`);
  const terminal = getTerminal({ name: EXTENSION_NAME });

  const open = commands.registerCommand('open-repository.openRepository', async () => {
    const query = await window.showInputBox({ placeHolder: `react`, prompt: `Enter package name` });

    if (isEmptyStringOrNil(query)) {
      return;
    }

    try {
      await openRepository(terminal, query);
    } catch (error) {
      showErrorMessage(query);
    }
  });

  const openFromSelection = commands.registerTextEditorCommand(
    'open-repository.openRepositoryFromSelection',
    async (editor) => {
      const query = editor?.document.getText(editor.selection);

      if (isEmptyStringOrNil(query)) {
        return;
      }

      try {
        await openRepository(terminal, query);
      } catch (error) {
        showErrorMessage(query);
      }
    },
  );

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

  return window.terminals.find((terminal) => terminal.name === name);
}

function getTerminal(options: TerminalOptions) {
  const activeTerminal = findTerminal(options.name);

  if (activeTerminal) {
    return activeTerminal;
  }

  return window.createTerminal({
    ...options,
    // hideFromUser: true,
  });
}

function openRepository(terminal: Terminal, query: string) {
  return new Promise(async (resolve, reject) => {
    const command = `npm repo ${query}`;
    const backup = await env.clipboard.readText();
    let done = false;

    terminal.sendText(command);
    terminal.sendText(`
    if [ $? -eq 0 ]
    then
      echo "success" | pbcopy
    else
      echo "fail" | pbcopy
    fi
    `.trim());

    window.withProgress({
      title: `${GROUP} trying to open repository '${query}'`,
      location: ProgressLocation.Notification,
    }, async progress => {
      const step = (INTERVAL / TIMEOUT) * 100;
      let tick = step;

      return new Promise<void>(async resolve => {
        const intervalId = setInterval(() => {
          if (done) {
            clearInterval(intervalId);
            resolve();
          }

          progress.report({ increment: tick });

          tick += step;

        }, INTERVAL);

        await delay(TIMEOUT);

        resolve();
        clearInterval(intervalId);
      });
    });

    const intervalId = setInterval(async () => {
      const result = await env.clipboard.readText();
      const status = /success/.test(result) ? "success" : /fail/.test(result) ? "fail" : null;

      if (status == null) {
        return;
      }

      await env.clipboard.writeText(backup);

      done = true;
      status === 'success' ? resolve(status) : reject();
      clearInterval(intervalId);
    }, INTERVAL);

    await delay(TIMEOUT);

    resolve("timeout");
    clearInterval(intervalId);
  });
}

function showErrorMessage(query: string) {
  return window.showErrorMessage(`${GROUP} fail to open repository ${query}, check repository information in package.json`, `See Details`, `Close`)
    .then(button => {
      if (button === 'See Details') {
        const detailLink = Uri.parse(`https://docs.npmjs.com/cli/v8/configuring-npm/package-json#repository`);

        env.openExternal(detailLink);
      }
  });
}