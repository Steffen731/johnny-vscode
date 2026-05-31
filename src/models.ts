export type Target = "johnny" | "mops";

export interface Instruction {

    label?: string;

    opcode: string;

    argument?: string;

    lineNumber: number;
}

export interface ParsedProgram {

    target: Target;

    instructions: Instruction[];

    labels: Map<string, number>;
}