// See: https://stackoverflow.com/questions/39418555/syntaxerror-with-jest-and-react-and-importing-css-files
module.exports = {
    moduleNameMapper: {
        "\\.(css|scss|sass)$": "<rootDir>/config/StyleStubber",
        "\\.(svg|png|jpg|jpeg|gif)(\\?.*)?$": "<rootDir>/config/StyleStubber",
        "^@/assets/(.*)$": "<rootDir>/src/assets/$1",
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@/app/(.*)$": "<rootDir>/src/app/$1",
        "^@/resume/(.*)$": "<rootDir>/src/resume/$1",
        "^@/editor/(.*)$": "<rootDir>/src/editor/$1",
        "^@/controls/(.*)$": "<rootDir>/src/controls/$1",
        "^@/templates/(.*)$": "<rootDir>/src/templates/$1",
        "^@/help/(.*)$": "<rootDir>/src/help/$1",
        "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
    },
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
                jsxImportSource: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            }
        }]
    },
};