import { parse } from "./parser";
import { analyze } from "./semanticAnalyzer";

import { assembleJohnny }
    from "./backends/johnnyBackend";

export function compile(
    source: string
): string[] {

    const program =
        parse(source);

    analyze(program);

    switch (
        program.target
    ) {

        case "johnny":

            return assembleJohnny(
                program
            );

        case "mops":

            throw new Error(
                "MOPS backend not implemented yet."
            );

        default:

            throw new Error(
                "Unknown target."
            );
    }
}