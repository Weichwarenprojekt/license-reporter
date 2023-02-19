import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli } from "../test.util";

const fsMocked = jest.mocked(fs);
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});

describe('Parameter "--config"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads "license-reporter-config.ts" if no path is specified', async () => {
        await executeCli("--root", __dirname);
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "license-reporter.config.json"), "[]");
    });

    it("loads the config specified", async () => {
        await executeCli("--root", __dirname, "--config", "different.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "differentConfig.json"), "[]");
    });

    it("also works with JS files", async () => {
        await executeCli("--root", __dirname, "--config", "js.config.js");
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "jsConfig.json"), "[]");
    });

    it('notifies if specified config does not export "configuration"', async () => {
        await executeCli("--root", __dirname, "--config", "wrong.config.ts");
        expect(consoleWarn).toBeCalledWith('The specified configuration does not export a "configuration"');
        // Uses default config
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "3rdpartylicenses.json"), "[]");
    });

    it("loads a config from a different directory", async () => {
        await executeCli("--root", __dirname, "--config", "nested/nested.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "nestedConfig.json"), "[]");
    });

    it("throws if specified config does not exist", async () => {
        await executeCli("--root", __dirname, "--config", "unknown.config.ts");
        expect(consoleWarn).toBeCalledWith("Could not find a configuration file!");
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "3rdpartylicenses.json"), "[]");
    });
});
