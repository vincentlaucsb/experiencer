// See: https://stackoverflow.com/questions/39418555/syntaxerror-with-jest-and-react-and-importing-css-files
module.exports = {
    moduleNameMapper: {
        "^[./a-zA-Z0-9$_-]+\\.css|.scss$": "<rootDir>/config/StyleStubber",
        "^[./a-zA-Z0-9$_-]+\\.svg$": "<rootDir>/config/StyleStubber",
        "^[./a-zA-Z0-9$_-]+\\.png$": "<rootDir>/config/StyleStubber",
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
};