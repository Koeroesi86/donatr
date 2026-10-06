module.exports = {
  preset: "ts-jest",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  cacheDirectory: "<rootDir>/.cache/jest",
  testMatch: [
    "<rootDir>/src/**/*.(spec|test).{ts,tsx,js,jsx}"
  ],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost"
  },
};
