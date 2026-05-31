import { ParsedProgram } from "../model";
import { SemanticInfo } from "../semanticAnalyzer";

export function assembleMops(
    program: ParsedProgram,
    semanticInfo: SemanticInfo
): string[] {

    const output: string[] = [];

    for (const instruction of program.instructions) {

        switch (instruction.opcode) {

            case "TAKE":

                output.push(
                    `ld ${instruction.argument}`
                );

                break;

            case "SAVE":

                output.push(
                    `st ${instruction.argument}`
                );

                break;

            case "ADD":

                output.push(
                    `add ${instruction.argument}`
                );

                break;

            case "SUB":

                output.push(
                    `sub ${instruction.argument}`
                );

                break;

            case "JMP":

                output.push(
                    `jmp ${instruction.argument}`
                );

                break;

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