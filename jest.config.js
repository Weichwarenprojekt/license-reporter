/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: ["./src/**", "!./src/index.ts"],
    setupFilesAfterEnv: ["./test/test.setup.ts"],
};
