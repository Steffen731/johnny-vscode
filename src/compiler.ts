import { parse } from "./parser";
import { analyze } from "./semanticAnalyzer";

import { assembleJohnny } from "./backends/johnnyBackend";
import { assembleMops } from "./backends/mopsBackend";

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

            return assembleMops(
                program
            );

        default:

            throw new Error(
                "Unknown target."
            );
    }
}