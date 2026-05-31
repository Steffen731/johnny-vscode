import * as vscode from 'vscode';

const OPCODES: Record<string, string> = {
    TAKE: '01',
    ADD:  '02',
    SUB:  '03',
    SAVE: '04',
    JMP:  '05',
    TST:  '06',
    INC:  '07',
    DEC:  '08',
    NULL: '09',
    HLT:  '10'
};

interface ParsedLine {
    label?: string;
    instruction?: string;
    argument?: string;
    raw: string;
    lineNumber: number;
}

export function assemble(source: string): string[] {

    const lines = source.split(/\r?\n/);

    const parsed: ParsedLine[] = [];

    const labels = new Map<string, number>();

    let address = 0;

    for (let i = 0; i < lines.length; i++) {

        const raw = lines[i];

        const clean = raw.replace(/;.*/, '').trim();

        if (!clean) {
            continue;
        }

        let work = clean;

        let label: string | undefined;

        const labelMatch = work.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\:/);

        if (labelMatch) {

            label = labelMatch[1];

            labels.set(label, address);

            work = work.substring(labelMatch[0].length).trim();
        }

        if (!work) {
            continue;
        }

        const parts = work.split(/\s+/);

        parsed.push({
            label,
            instruction: parts[0].toUpperCase(),
            argument: parts[1],
            raw,
            lineNumber: i
        });

        address++;
    }

    const output: string[] = [];

    for (const line of parsed) {

        const instruction = line.instruction ?? '';

        if (instruction === 'DAT') {

            const value = Number(line.argument ?? '0');

            if (value < 0 || value > 19999) {
                throw new Error(
                    `DAT value out of range at line ${line.lineNumber + 1}`
                );
            }

            output.push(
                value.toString().padStart(5, '0')
            );

            continue;
        }

        const opcode = OPCODES[instruction];

        if (!opcode) {
            throw new Error(
                `Unknown instruction '${instruction}' at line ${line.lineNumber + 1}`
            );
        }

        let addressValue = 0;

        if (line.argument) {

            if (/^[0-9]+$/.test(line.argument)) {

                addressValue = Number(line.argument);

            } else {

                const resolved = labels.get(line.argument);

                if (resolved === undefined) {
                    throw new Error(
                        `Unknown label '${line.argument}' at line ${line.lineNumber + 1}`
                    );
                }

                addressValue = resolved;
            }
        }

        if (addressValue < 0 || addressValue > 999) {
            throw new Error(
                `Address out of range at line ${line.lineNumber + 1}`
            );
        }

        const encoded =
            opcode +
            addressValue.toString().padStart(3, '0');

        output.push(encoded);
    }

    return output;
}

export async function assembleActiveEditor() {

    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const source = editor.document.getText();

    try {

        const ram = assemble(source);

        const content = ram.join('\n');

        const uri = editor.document.uri;

        const targetPath =
            uri.fsPath.replace(/\.jasm$/i, '.ram');

        const targetUri = vscode.Uri.file(targetPath);

        const encoder = new TextEncoder();

        await vscode.workspace.fs.writeFile(
            targetUri,
            encoder.encode(content)
        );

        vscode.window.showInformationMessage(
            `RAM file written: ${targetPath}`
        );

        const document =
            await vscode.workspace.openTextDocument(targetUri);

        await vscode.window.showTextDocument(document);

    } catch (err) {

        vscode.window.showErrorMessage(
            String(err)
        );

    }
}