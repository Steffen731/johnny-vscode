# JOHNNY VS-Code Extension (MVP)

## Projektstruktur

```text
johnny-vscode/
├── package.json
├── tsconfig.json
├── language-configuration.json
├── syntaxes/
│   └── johnny.tmLanguage.json
├── src/
│   ├── extension.ts
│   ├── assembler.ts
│   └── diagnostics.ts
├── snippets/
│   └── johnny.json
├── examples/
│   └── multiply.jasm
└── README.md
```

---

# package.json

```json
{
  "name": "johnny-vscode",
  "displayName": "JOHNNY Assembler",
  "description": "VS Code support for JOHNNY educational assembly language",
  "version": "0.0.1",
  "publisher": "johnny",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Programming Languages"
  ],
  "activationEvents": [
    "onLanguage:johnny",
    "onCommand:johnny.assemble"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "languages": [
      {
        "id": "johnny",
        "aliases": [
          "JOHNNY",
          "johnny"
        ],
        "extensions": [
          ".jasm"
        ],
        "configuration": "./language-configuration.json"
      }
    ],
    "grammars": [
      {
        "language": "johnny",
        "scopeName": "source.johnny",
        "path": "./syntaxes/johnny.tmLanguage.json"
      }
    ],
    "commands": [
      {
        "command": "johnny.assemble",
        "title": "JOHNNY: Assemble File"
      }
    ],
    "snippets": [
      {
        "language": "johnny",
        "path": "./snippets/johnny.json"
      }
    ]
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/vscode": "^1.85.0",
    "typescript": "^5.3.0"
  }
}
```

---

# tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true
  },
  "exclude": ["node_modules", ".vscode-test"]
}
```

---

# language-configuration.json

```json
{
  "comments": {
    "lineComment": ";"
  },
  "brackets": [
    ["(", ")"]
  ],
  "autoClosingPairs": [
    {
      "open": "(",
      "close": ")"
    }
  ]
}
```

---

# syntaxes/johnny.tmLanguage.json

```json
{
  "scopeName": "source.johnny",
  "name": "JOHNNY",
  "patterns": [
    {
      "match": ";.*$",
      "name": "comment.line.semicolon.johnny"
    },
    {
      "match": "\\b(TAKE|SAVE|ADD|SUB|TST|JMP|INC|DEC|NULL|HLT|DAT)\\b",
      "name": "keyword.control.johnny"
    },
    {
      "match": "^[a-zA-Z_][a-zA-Z0-9_]*:",
      "name": "entity.name.label.johnny"
    },
    {
      "match": "\\b[0-9]+\\b",
      "name": "constant.numeric.johnny"
    }
  ]
}
```

---

# src/assembler.ts

```typescript
import * as vscode from 'vscode';

const OPCODES: Record<string, string> = {
    TAKE: '01',
    SAVE: '02',
    ADD: '03',
    SUB: '04',
    TST: '05',
    JMP: '06',
    INC: '07',
    DEC: '08',
    NULL: '09',
    HLT: '10'
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
            output.push(value.toString().padStart(5, '0'));
            continue;
        }

        const opcode = OPCODES[instruction];

        if (!opcode) {
            throw new Error(`Unknown instruction '${instruction}' at line ${line.lineNumber + 1}`);
        }

        let addressValue = 0;

        if (line.argument) {
            if (/^[0-9]+$/.test(line.argument)) {
                addressValue = Number(line.argument);
            } else {
                const resolved = labels.get(line.argument);

                if (resolved === undefined) {
                    throw new Error(`Unknown label '${line.argument}' at line ${line.lineNumber + 1}`);
                }

                addressValue = resolved;
            }
        }

        const encoded = opcode + addressValue.toString().padStart(3, '0');

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

        const document = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });

        await vscode.window.showTextDocument(document);

    } catch (err) {
        vscode.window.showErrorMessage(String(err));
    }
}
```

---

# src/diagnostics.ts

```typescript
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

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);

        const text = line.text.replace(/;.*/, '').trim();

        if (!text) {
            continue;
        }

        const withoutLabel = text.replace(/^([a-zA-Z_][a-zA-Z0-9_]*)\:/, '').trim();

        if (!withoutLabel) {
            continue;
        }

        const parts = withoutLabel.split(/\s+/);

        const instruction = parts[0].toUpperCase();

        if (!VALID.has(instruction)) {
            const diagnostic = new vscode.Diagnostic(
                line.range,
                `Unknown instruction '${instruction}'`,
                vscode.DiagnosticSeverity.Error
            );

            diagnostics.push(diagnostic);
        }
    }

    collection.set(document.uri, diagnostics);
}
```

---

# src/extension.ts

```typescript
import * as vscode from 'vscode';
import { assembleActiveEditor } from './assembler';
import { refreshDiagnostics } from './diagnostics';

export function activate(context: vscode.ExtensionContext) {

    const diagnostics = vscode.languages.createDiagnosticCollection('johnny');

    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document, diagnostics);
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            refreshDiagnostics(event.document, diagnostics);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            refreshDiagnostics(document, diagnostics);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('johnny.assemble', async () => {
            await assembleActiveEditor();
        })
    );
}

export function deactivate() {}
```

---

# snippets/johnny.json

```json
{
  "Loop": {
    "prefix": "loop",
    "body": [
      "loop:",
      "    TAKE counter",
      "    TST counter",
      "    JMP end",
      "    DEC counter",
      "    JMP loop",
      "",
      "end:",
      "    HLT 000"
    ],
    "description": "Simple JOHNNY loop"
  }
}
```

---

# examples/multiply.jasm

```asm
; Multiplikation zweier Zahlen

        NULL result

loop:
        TAKE result
        ADD factor1
        SAVE result

        DEC factor2
        TST factor2
        JMP end

        JMP loop

end:
        HLT 000

factor1: DAT 5
factor2: DAT 3
result:  DAT 0
```

---

# README.md

```md
# JOHNNY VS-Code Extension

VS-Code-Unterstützung für den JOHNNY-Rechner.

## Features

- Syntax Highlighting
- Diagnostics
- Labels
- DAT-Pseudobefehl
- Assembler (.jasm -> .ram)

## Beispiel

```asm
start:
    TAKE value1
    ADD value2
    SAVE result
    HLT 000

value1: DAT 5
value2: DAT 3
result: DAT 0
```

## Build

```bash
npm install
npm run compile
```

## Starten

F5 in VS Code drücken.

## Assembler ausführen

Command Palette:

```text
JOHNNY: Assemble File
```

## Geplante Features

- Simulator
- Step Debugger
- RAM Visualisierung
- Kontrollflussgraph
- Schüler-Modus
```

---

# Installation

```bash
npm install -g yo generator-code
yo code
```

Dann Dateien ersetzen.

Danach:

```bash
npm install
npm run compile
```

In VS Code:

```text
F5
```

Neue Datei:

```text
example.jasm
```

Command Palette:

```text
JOHNNY: Assemble File
```

Die erzeugte Ausgabe entspricht dem JOHNNY-.ram-Format.

