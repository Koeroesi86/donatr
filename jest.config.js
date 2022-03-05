module.exports = {
  preset: "ts-jest",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  cacheDirectory: "<rootDir>/.cache/jest",
  testMatch: [
    "<rootDir>/src/**/*.(spec|test).{ts,tsx,js,jsx}"
  ],
  // setupFilesAfterEnv: [
  //   "<rootDir>/src/setupTests.ts"
  // ],
  snapshotSerializers: [
    "enzyme-to-json/serializer"
  ],
  testEnvironment: "jsdom",
  testURL: "http://localhost",
  // moduleNameMapper: {
  //   "\\.(css|scss)$": "identity-obj-proxy"
  // },
  // transform: {
  //   "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
  //   "^.+\\.(css|scss)$": "<rootDir>/config/jest/cssTransform.js",
  //   "^(?!.*\\.(css|json)$)": "<rootDir>/config/jest/fileTransform.js"
  // },
  // transformIgnorePatterns: [
  //   "[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"
  // ],
  // moduleFileExtensions: [
  //   "ts",
  //   "tsx",
  //   "js",
  //   "json",
  //   "jsx",
  //   "node"
  // ]
};
