// See: https://stackoverflow.com/questions/39418555/syntaxerror-with-jest-and-react-and-importing-css-files
module.exports = {
    moduleNameMapper: {
        "\\.(css|scss|sass)(\\?.*)?$": "<rootDir>/config/StyleStubber",
        "\\.(svg|png|jpg|jpeg|gif)(\\?.*)?$": "<rootDir>/config/StyleStubber",
        "^react-markdown$": "<rootDir>/config/ReactMarkdownMock.js",
        "^rehype-raw$": "<rootDir>/config/StyleStubber",
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
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', {
            jsc: {
                parser: {
                    syntax: 'typescript',
                    tsx: true,
                    decorators: true,
                },
                transform: {
                    react: {
                        runtime: 'automatic',
                    },
                },
            },
        }]
    },
    // Handle ESM packages like react-markdown, rehype-raw
    transformIgnorePatterns: [
        'node_modules/(?!(react-markdown|micromark|character-entities|decode-named-character-reference|unist-|unified|ccount|rehype-|hast-|vfile|web-namespaces|comma-separated-tokens|property-information|space-separated-tokens)/)'
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};