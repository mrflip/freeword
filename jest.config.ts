import      { createJsWithTsEsmPreset, type JestConfigWithTsJest } from 'ts-jest' // eslint-disable-line import/no-extraneous-dependencies

const presetConfig = createJsWithTsEsmPreset({
  tsconfig:       '<rootDir>/tests/tsconfig.json',
  diagnostics:    { warnOnly: true },
  // useESM:         true,
})

// For a detailed explanation regarding each configuration property, visit: https://jestjs.io/docs/en/configuration.html
const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  // testMatch:              ['**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/tmp/', '<rootDir>/node_modules/'],
  // extensionsToTreatAsEsm: ['.ts'],

  roots:                ['meta/src', 'db', 'tests'],            // Directories Jest should search for files and tests
  moduleFileExtensions: ['js', 'ts', 'json', 'node', 'eta'],      // reload on eta files too
  setupFilesAfterEnv:   ['./tests/setupFilesAfterEnv.ts'],        // A list of paths to modules that run some code to configure or set up the testing framework before each test
  snapshotResolver:      '<rootDir>/tests/snapshotResolver.cjs',  // don't pollute the code dirs with snapshot artifacts
  testEnvironment:       'node',                                  // The test environment that will be used for testing
  verbose:                true,
  resolver:              'ts-jest-resolver',
  // collectCoverageFrom: [
  //   'lib/**/*.ts',
  //   'composables/**/*.ts',
  //   '!**/*.d.ts',
  // ],
  moduleNameMapper: {
    '^@freeword/meta$': '<rootDir>/meta/src',
    '^@freeword/meta/(.*)$': '<rootDir>/meta/src/$1',
    '^@freeword/all-byword$': '<rootDir>/repos/freeword-all-byword',
    '^@freeword/all-byword/(.*)$': '<rootDir>/repos/freeword-all-byword/$1',
    // Remove or comment out the old '@/...' mappings to src
    // '^@/db/(.*)$': '<rootDir>/db/$1',
    // '^@/(.*)$': '<rootDir>/src/$1',
  },
  // tsconfig: 'tsconfig.test.json',
}

export default jestConfig