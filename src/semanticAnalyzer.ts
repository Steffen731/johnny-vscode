import { ParsedProgram } from "./model";

export interface SemanticInfo {

    variables: Set<string>;

    numericAddresses: Set<number>;

    selfModifyingCandidates: Set<string>;

    tstInstructions: number[];
}

export function analyze(
    program: ParsedProgram
): SemanticInfo {

    const variables =
        new Set<string>();

    const numericAddresses =
        new Set<number>();

    const selfModifyingCandidates =
        new Set<string>();

    const tstInstructions: number[] = [];

    for (const instruction of program.instructions) {

        if (
            instruction.opcode === "DAT" &&
            instruction.label
        ) {

            variables.add(
                instruction.label
            );
        }

        if (
            instruction.argument &&
            /^[0-9]+$/.test(
                instruction.argument
            )
        ) {

            numericAddresses.add(
                Number(
                    instruction.argument
                )
            );
        }

        if (
            instruction.opcode === "TST"
        ) {

            tstInstructions.push(
                instruction.lineNumber
            );
        }

        if (
            instruction.opcode === "INC" ||
            instruction.opcode === "DEC" ||
            instruction.opcode === "NULL"
        ) {

            if (
                instruction.argument &&
                program.labels.has(
                    instruction.argument
                )
            ) {

                selfModifyingCandidates.add(
                    instruction.argument
                );
            }
        }
    }

    return {

        variables,

        numericAddresses,

        selfModifyingCandidates,

        tstInstructions
    };
}