import { ParsedProgram } from "../model";

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

export function assembleJohnny(
    program: ParsedProgram
): string[] {

    const output: string[] = [];

    for (const line of program.instructions) {

        const instruction = line.opcode;

        if (instruction === 'DAT') {

            const value =
                Number(line.argument ?? '0');

            output.push(
                value.toString().padStart(5, '0')
            );

            continue;
        }

        const opcode =
            OPCODES[instruction];

        if (!opcode) {

            throw new Error(
                `Unknown instruction '${instruction}' at line ${line.lineNumber}`
            );
        }

        let addressValue = 0;

        if (line.argument) {

            if (/^[0-9]+$/.test(line.argument)) {

                addressValue =
                    Number(line.argument);

            } else {

                const resolved =
                    program.labels.get(
                        line.argument
                    );

                if (
                    resolved === undefined
                ) {

                    throw new Error(
                        `Unknown label '${line.argument}' at line ${line.lineNumber}`
                    );
                }

                addressValue =
                    resolved;
            }
        }

        output.push(

            opcode +

            addressValue
                .toString()
                .padStart(3, '0')
        );
    }

    return output;
}