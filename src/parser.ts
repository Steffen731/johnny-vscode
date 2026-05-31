import {
    Instruction,
    ParsedProgram,
    Target
} from "./model";

export function parse(
    source: string
): ParsedProgram {

    const instructions: Instruction[] = [];

    const labels =
        new Map<string, number>();

    let target: Target = "johnny";

    const lines =
        source.split(/\r?\n/);

    let address = 0;

    for (let i = 0; i < lines.length; i++) {

        const raw = lines[i];

        if (
            raw.trim().toLowerCase() ===
            "; @target mops"
        ) {
            target = "mops";
            continue;
        }

        const clean =
            raw.replace(/;.*/, "").trim();

        if (!clean) {
            continue;
        }

        let work = clean;

        let label: string | undefined;

        const match =
            work.match(
                /^([a-zA-Z_][a-zA-Z0-9_]*)\:/
            );

        if (match) {

            label = match[1];

            labels.set(
                label,
                address
            );

            work =
                work.substring(
                    match[0].length
                ).trim();
        }

        if (!work) {
            continue;
        }

        const parts =
            work.split(/\s+/);

        instructions.push({

            label,

            opcode:
                parts[0].toUpperCase(),

            argument:
                parts[1],

            lineNumber:
                i + 1
        });

        address++;
    }

    return {

        target,

        instructions,

        labels
    };
}