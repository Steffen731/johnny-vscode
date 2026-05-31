import * as vscode from 'vscode';

const VALID = new Set([
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
]);

export function refreshDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection
) {

    const diagnostics: vscode.Diagnostic[] = [];

    const labels = new Map<string, number>();

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {

        const line = document.lineAt(lineIndex);

        const text =
            line.text.replace(/;.*/, '').trim();

        if (!text) {
            continue;
        }

        const labelMatch =
            text.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\:/);

        if (labelMatch) {

            const label = labelMatch[1];

            if (labels.has(label)) {

                diagnostics.push(
                    new vscode.Diagnostic(
                        line.range,
                        `Duplicate label '${label}'`,
                        vscode.DiagnosticSeverity.Error
                    )
                );

            } else {

                labels.set(label, lineIndex);

            }
        }
    }

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {

        const line = document.lineAt(lineIndex);

        const text =
            line.text.replace(/;.*/, '').trim();

        if (!text) {
            continue;
        }

        const withoutLabel =
            text.replace(
                /^([a-zA-Z_][a-zA-Z0-9_]*)\:/,
                ''
            ).trim();

        if (!withoutLabel) {
            continue;
        }

        const parts =
            withoutLabel.split(/\s+/);

        const instruction =
            parts[0].toUpperCase();

        const argument =
            parts[1];

        if (!VALID.has(instruction)) {

            diagnostics.push(
                new vscode.Diagnostic(
                    line.range,
                    `Unknown instruction '${instruction}'`,
                    vscode.DiagnosticSeverity.Error
                )
            );

            continue;
        }

        if (instruction !== 'HLT' && !argument) {

            diagnostics.push(
                new vscode.Diagnostic(
                    line.range,
                    `Missing argument for '${instruction}'`,
                    vscode.DiagnosticSeverity.Error
                )
            );
        }

        if (instruction === 'DAT' && argument) {

            const value = Number(argument);

            if (
                Number.isNaN(value) ||
                value < 0 ||
                value > 19999
            ) {

                diagnostics.push(
                    new vscode.Diagnostic(
                        line.range,
                        `DAT value must be between 0 and 19999`,
                        vscode.DiagnosticSeverity.Error
                    )
                );
            }
        }

        if (
            instruction !== 'DAT' &&
            instruction !== 'HLT' &&
            argument
        ) {

            if (/^[0-9]+$/.test(argument)) {

                const value = Number(argument);

                if (
                    value < 0 ||
                    value > 999
                ) {

                    diagnostics.push(
                        new vscode.Diagnostic(
                            line.range,
                            `Address must be between 0 and 999`,
                            vscode.DiagnosticSeverity.Error
                        )
                    );
                }

            } else {

                if (!labels.has(argument)) {

                    diagnostics.push(
                        new vscode.Diagnostic(
                            line.range,
                            `Unknown label '${argument}'`,
                            vscode.DiagnosticSeverity.Error
                        )
                    );
                }
            }
        }
    }

    collection.set(
        document.uri,
        diagnostics
    );
}