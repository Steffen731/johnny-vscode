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
