import { describe, it } from "@jest/globals";
import {execSync} from "child_process";

function executeCli(): void {
    execSync("node ./src/index.js");
}

describe("index.spec.ts", () => {
    it("first test", () => {
        executeCli();
    });
});
