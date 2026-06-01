import { ParsedProgram } from "../model";
import { SemanticInfo } from "../semanticAnalyzer";

function mapOperand(
    operand: string | undefined,
    semanticInfo: SemanticInfo
): string {

    if (!operand) {
        return "";
    }

    return (
        semanticInfo.variableMap.get(
            operand
        ) ?? operand
    );
}

export function assembleMops(
    program: ParsedProgram,
    semanticInfo: SemanticInfo
): string[] {

    let skipCounter = 0;

    const output: string[] = [];

    for (
        let i = 0;
        i < program.instructions.length;
        i++
    ) {

        const instruction =
            program.instructions[i];

       if (
            instruction.label &&
            instruction.opcode !== "DAT"
        ) {

            output.push(
                `:${instruction.label}`
            );
        }

        switch (instruction.opcode) {

            case "TAKE":
                output.push(
                    `ld ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }`
                );

                break;

            case "SAVE":
                output.push(
                    `st ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }`
                );
                
                break;

            case "ADD":

                output.push(
                    `add ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }`
                );

                break;

            case "SUB":

                output.push(
                    `sub ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }`
                );

                break;

            case "JMP": {

                output.push(
                    `jmp ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }`
                );

                if (
                    i > 0 &&
                    program.instructions[i - 1].opcode === "TST"
                ) {

                    output.push(
                        `:__skip${skipCounter}`
                    );
                }

                break;
            }

            case "INC": {

                const target =
                    mapOperand(
                        instruction.argument,
                        semanticInfo
                    );

                output.push(
                    `ld ${target}`
                );

                output.push(
                    "add 1"
                );

                output.push(
                    `st ${target}`
                );

                break;
            }

            case "DEC": {

                const target =
                    mapOperand(
                        instruction.argument,
                        semanticInfo
                    );

                output.push(
                    `ld ${target}`
                );

                output.push(
                    "sub 1"
                );

                output.push(
                    `st ${target}`
                );

                break;
            }

            case "NULL": {

                const target =
                    mapOperand(
                        instruction.argument,
                        semanticInfo
                    );

                output.push(
                    "ld 0"
                );

                output.push(
                    `st ${target}`
                );

                break;
            }

            case "TST": {

                const next =
                    program.instructions[i + 1];

                if (
                    next &&
                    next.opcode === "JMP"
                ) {

                    const operand =
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        );

                    const skipLabel =
                        `__skip${++skipCounter}`;

                    output.push(
                        `ld ${operand}`
                    );

                    output.push(
                        "cmp 0"
                    );

                    output.push(
                        `jeq ${skipLabel}`
                    );

                    break;
                }

                throw new Error(
                    "MOPS backend currently supports only TST followed by JMP."
                );
            }

            case "HLT":

                output.push(
                    "end"
                );

                break;

            case "DAT":

                break;

            default:

                throw new Error(
                    `Opcode '${instruction.opcode}' not yet supported by MOPS`
                );
        }
    }

    return output;
}