import { parse } from "./parser";
import { analyze } from "./semanticAnalyzer";

import { assembleJohnny } from "./backends/johnnyBackend";
import { assembleMops } from "./backends/mopsBackend";
import {CompileResult} from "./model";

export function compile(
    source: string
): CompileResult {

    const program =
        parse(source);

    analyze(program);

    switch (
        program.target
    ) {

        case "johnny":

            return {

                target: "johnny",

                lines:
                    assembleJohnny(
                        program
                    )
            };

        case "mops":

            return {

                target: "mops",

                lines:
                    assembleMops(
                        program
                    )
            };

        default:

            throw new Error(
                "Unknown target."
            );
    }
}