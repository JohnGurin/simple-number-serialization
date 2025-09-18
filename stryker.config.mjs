// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "npm",
  reporters: ["progress", 'html'],
  testRunner: "command",
  coverageAnalysis: "off",
  checkers: ["typescript"],
  mutate: ["src/codec/*.ts", "!src/**/*.spec.ts"],
  timeoutFactor: 1.2,
  timeoutMS: 2000,
  incremental: true,
};
export default config;
