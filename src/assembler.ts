import * as vscode from 'vscode';
import { Buffer } from 'buffer';
import { parse } from './parser';
import { assembleJohnny } from './backends/johnnyBackend';
import { analyze } from './semanticAnalyzer';
import { compile } from "./compiler";

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

import {CompileResult} from "./model";

export function assemble(
    source: string
): CompileResult {

    return compile(
        source
    );
}

export async function assembleActiveEditor() {

    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const source = editor.document.getText();

    try {

        const result =
            assemble(source);

        const content =
            result.lines.join('\n');

        const uri = editor.document.uri;

        const extension =

            result.target === "mops"

                ? ".a"

                : ".ram";

        const targetPath =
            uri.fsPath.replace(
                /\.jasm$/i,
                extension
            );

        const targetUri = vscode.Uri.file(targetPath);

        const buffer =
            Buffer.from(content, "utf8");

        await vscode.workspace.fs.writeFile(
            targetUri,
            buffer
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