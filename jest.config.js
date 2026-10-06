module.exports = {
  preset: "ts-jest",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/build/"
  ],
  cacheDirectory: "<rootDir>/.cache/jest",
  testMatch: [
    "<rootDir>/src/**/*.(spec|test).{ts,tsx,js,jsx}"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.ts"
  ],
  moduleNameMapper: {
    "^chokidar$": "<rootDir>/src/test/mocks/chokidar.ts",
    "^uuid$": "<rootDir>/src/test/mocks/uuid.ts"
  },
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost"
  },
};
