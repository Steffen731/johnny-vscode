import * as vscode from 'vscode';

const OPCODES: Record<string, string> = {

    '01': 'TAKE',
    '02': 'ADD',
    '03': 'SUB',
    '04': 'SAVE',
    '05': 'JMP',
    '06': 'TST',
    '07': 'INC',
    '08': 'DEC',
    '09': 'NULL',
    '10': 'HLT'
};

export function registerRamHoverProvider(
    context: vscode.ExtensionContext
) {

    const provider =
        vscode.languages.registerHoverProvider(
            'johnnyram',

            {

                provideHover(document, position) {

                    const range =
                        document.getWordRangeAtPosition(
                            position,
                            /\b[0-9]{5}\b/
                        );

                    if (!range) {
                        return;
                    }

                    const word =
                        document.getText(range);

                    const opcode =
                        word.substring(0, 2);

                    const address =
                        word.substring(2);

                    const mnemonic =
                        OPCODES[opcode];

                    if (!mnemonic) {
                        return;
                    }

                    const text =
`Maschinenbefehl: ${word}

Opcode: ${opcode}

Mnemonic: ${mnemonic}

Adresse: ${address}`;

                    return new vscode.Hover(text);
                }
            }
        );

    context.subscriptions.push(provider);
}