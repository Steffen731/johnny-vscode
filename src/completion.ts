import * as vscode from 'vscode';

const COMMANDS = [
    'TAKE',
    'SAVE',
    'ADD',
    'SUB',
    'TST',
    'JMP',
    'INC',
    'DEC',
    'NULL',
    'HLT',
    'DAT'
];

export function registerCompletionProvider(
    context: vscode.ExtensionContext
) {

    const provider =
        vscode.languages.registerCompletionItemProvider(
            'johnny',
            {

                provideCompletionItems() {

                    return COMMANDS.map(cmd => {

                        const item =
                            new vscode.CompletionItem(
                                cmd,
                                vscode.CompletionItemKind.Keyword
                            );

                        item.insertText = cmd;

                        return item;
                    });
                }

            }
        );

    context.subscriptions.push(provider);
}