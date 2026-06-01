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

function appendPendingLabel(
    text: string,
    pendingLabel: string | null
): string {

    if (!pendingLabel) {
        return text;
    }

    return `${text} :${pendingLabel}`;
}

export function assembleMops(
    program: ParsedProgram,
    semanticInfo: SemanticInfo
): string[] {

    let skipCounter = 0;
    let pendingLabel: string | null = null;

    const output: string[] = [];

    for (
        let i = 0;
        i < program.instructions.length;
        i++
    ) {

        const instruction =
            program.instructions[i];

        const labelSuffix =

        instruction.label &&
        instruction.opcode !== "DAT"

            ? ` :${instruction.label}`

            : "";

        switch (instruction.opcode) {

            case "TAKE":

                output.push(
                    `ld ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }${labelSuffix}`
                );

                break;

            case "SAVE":

                output.push(
                    `st ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }${labelSuffix}`
                );

                break;

            case "ADD":

                output.push(
                    `add ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }${labelSuffix}`
                );

                break;

            case "SUB":

                output.push(
                    `sub ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }${labelSuffix}`
                );

                break;

            case "JMP": {

                output.push(
                    `jmp ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }${labelSuffix}`
                );

                break;
            }

            case "INC": {

                const target =
                    mapOperand(
                        instruction.argument,
                        semanticInfo
                    );

                output.push(
                    `ld ${target}${labelSuffix}`
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
                    `ld ${target}${labelSuffix}`
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
                    `ld 0${labelSuffix}`
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
                    !next ||
                    next.opcode !== "JMP"
                ) {

                    throw new Error(
                        "MOPS unterstützt derzeit nur TST gefolgt von JMP."
                    );
                }

                const operand =
                    mapOperand(
                        instruction.argument,
                        semanticInfo
                    );

                const skipLabel =
                    `skip${++skipCounter}`;
                pendingLabel = skipLabel;

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

            case "HLT":

                output.push(
                    appendPendingLabel(
                        "end",
                        pendingLabel
                    )
                );

                pendingLabel = null;

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