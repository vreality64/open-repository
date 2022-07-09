import * as vscode from 'vscode';

const GROUP = `[Open Repository] `;

export function activate(context: vscode.ExtensionContext) {
  console.log(`${GROUP} start initialize open-repository extension`);

  let disposable = vscode.commands.registerCommand('open-repository.helloWorld', () => {

    console.log(`${GROUP} find ${''} from node modules...`);
    // TODO
    // 1. find package into node modules
    // 2. open repository url in browser
    vscode.window.showInformationMessage('Hello World from open-repository!');
  });

  context.subscriptions.push(disposable);

  console.log(`${GROUP} open-repository initialized successfully`);
}

// this method is called when your extension is deactivated
export function deactivate() {}
