import * as vscode from 'vscode';

import { assembleActiveEditor } from './assembler';
import { refreshDiagnostics } from './diagnostics';

import { registerHoverProvider } from './hover';
import { registerRamHoverProvider } from './ramHover';
import { registerCompletionProvider } from './completion';


export function activate(
    context: vscode.ExtensionContext
) {

    const diagnostics =
        vscode.languages.createDiagnosticCollection(
            'johnny'
        );

    /*
        Nur JOHNNY-Dateien prüfen
    */
    if (
        vscode.window.activeTextEditor &&
        vscode.window.activeTextEditor.document.languageId === 'johnny'
    ) {

        refreshDiagnostics(
            vscode.window.activeTextEditor.document,
            diagnostics
        );
    }

    /*
        Beim Bearbeiten prüfen
    */
    context.subscriptions.push(

        vscode.workspace.onDidChangeTextDocument(
            event => {

                if (
                    event.document.languageId !== 'johnny'
                ) {
                    return;
                }

                refreshDiagnostics(
                    event.document,
                    diagnostics
                );
            }
        )
    );

    /*
        Beim Öffnen prüfen
    */
    context.subscriptions.push(

        vscode.workspace.onDidOpenTextDocument(
            document => {

                if (
                    document.languageId !== 'johnny'
                ) {
                    return;
                }

                refreshDiagnostics(
                    document,
                    diagnostics
                );
            }
        )
    );

    /*
        Assemble-Befehl
    */
    context.subscriptions.push(

        vscode.commands.registerCommand(
            'johnny.assemble',

            async () => {

                await assembleActiveEditor();

            }
        )
    );

    /*
        Hover-Hilfe
    */
    registerHoverProvider(context);

    /*
        IntelliSense
    */
    registerCompletionProvider(context);
    registerRamHoverProvider(context);
}

export function deactivate() {}