import { jest } from "@jest/globals";
import fs from "fs";

/**
 * Mock fs globally
 */
jest.mock("fs", () => {
    return { ...jest.requireActual<typeof fs>("fs"), writeFileSync: jest.fn(), mkdirSync: jest.fn() };
});
