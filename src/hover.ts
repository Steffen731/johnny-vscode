import * as vscode from 'vscode';

const DOCS: Record<string, string> = {

    TAKE:
`TAKE addr

Lädt den Inhalt einer Speicherzelle in den Akkumulator.

Opcode: 01`,

    ADD:
`ADD addr

Addiert den Inhalt einer Speicherzelle zum Akkumulator.

Opcode: 02`,

    SUB:
`SUB addr

Subtrahiert den Inhalt einer Speicherzelle vom Akkumulator.

Opcode: 03`,

    SAVE:
`SAVE addr

Speichert den Inhalt des Akkumulators in eine Speicherzelle.

Opcode: 04`,

    JMP:
`JMP addr

Springt zu einer absoluten Speicheradresse.

Opcode: 05`,

    TST:
`TST addr

Überspringt den nächsten Befehl, falls die Speicherzelle den Wert 0 enthält.

Opcode: 06`,

    INC:
`INC addr

Erhöht den Inhalt einer Speicherzelle um 1.

Opcode: 07`,

    DEC:
`DEC addr

Verringert den Inhalt einer Speicherzelle um 1.

Opcode: 08`,

    NULL:
`NULL addr

Setzt den Inhalt einer Speicherzelle auf 0.

Opcode: 09`,

    HLT:
`HLT 000

Stoppt die Programmausführung.

Opcode: 10`,

    DAT:
`DAT value

Pseudo-Befehl zur Definition von Datenwerten.`
};

export function registerHoverProvider(
    context: vscode.ExtensionContext
) {

    const provider =
        vscode.languages.registerHoverProvider(
            'johnny',
            {

                provideHover(document, position) {

                    const range =
                        document.getWordRangeAtPosition(position);

                    if (!range) {
                        return;
                    }

                    const word =
                        document.getText(range).toUpperCase();

                    const doc = DOCS[word];

                    if (!doc) {
                        return;
                    }

                    return new vscode.Hover(doc);
                }
            }
        );

    context.subscriptions.push(provider);
}