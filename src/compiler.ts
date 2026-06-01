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

    const semanticInfo = analyze(program);

    if (
        program.target === "mops" &&
        semanticInfo.variableCount > 8
    ) {

        throw new Error(
            "MOPS unterstützt maximal 8 Variablen."
        );
    }

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
                        program,
                        semanticInfo
                    )
            };

        default:

            throw new Error(
                "Unknown target."
            );
    }
}