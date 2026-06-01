import { ParsedProgram } from "./model";

export interface SemanticInfo {

    variables: Set<string>;

    variableMap: Map<string, string>;

    variableCount: number;

    numericAddresses: Set<number>;

    selfModifyingCandidates: Set<string>;

    tstInstructions: number[];
}

export function analyze(
    program: ParsedProgram
): SemanticInfo {

    const variables =
        new Set<string>();

    const variableMap =
        new Map<string, string>();

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

            if (!instruction.argument) {
                continue;
            }

            const labelAddress =
                program.labels.get(
                    instruction.argument
                );

            if (
                labelAddress === undefined
            ) {
                continue;
            }

            const targetInstruction =
                program.instructions[
                    labelAddress
                ];

            if (
                targetInstruction &&
                targetInstruction.opcode !== "DAT"
            ) {

                selfModifyingCandidates.add(
                    instruction.argument
                );
            }
        }
    }

    const aliases = [

        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h"
    ];

    let index = 0;

    for (const variable of variables) {

        if (index < aliases.length) {

            variableMap.set(
                variable,
                aliases[index]
            );
        }

        index++;
    }

    return {

        variables,

        variableMap,

        variableCount:
            variables.size,

        numericAddresses,

        selfModifyingCandidates,

        tstInstructions
    };
}