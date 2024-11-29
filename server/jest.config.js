/** @type {import('jest').Config} */
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");
console.log(compilerOptions.paths);
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    rootPath: "./src",
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/src/" }),

    testPathIgnorePatterns: ["/node_modules/", "/dist/", "/node_modules/*"],

    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
};
