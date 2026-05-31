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

    const output: string[] = [];

    for (const instruction of program.instructions) {

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

            case "JMP":

                output.push(
                    `jmp ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }`
                );
                
                break;

            case "HLT":

                output.push(
                    `end ${
                        mapOperand(
                            instruction.argument,
                            semanticInfo
                        )
                    }`
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