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

export interface CompileResult {

    target: Target;

    lines: string[];
}

export interface SemanticInfo {

    variables: Set<string>;

    variableMap: Map<string,string>;

    numericAddresses: Set<number>;

    selfModifyingCandidates: Set<string>;

    tstInstructions: number[];
}