// Mock for react-markdown in Jest tests
// Just renders children as-is without actual Markdown processing
module.exports = function Markdown({ children }) {
    return children;
};
