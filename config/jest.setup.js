// Mock ResizeObserver for tests
// ResizeObserver is now widely supported but not available in jsdom test environment
const { TextDecoder, TextEncoder } = require('node:util');

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// jsdom has no pseudo-element styles. Inline hints inherit their input typography;
// Playwright covers the actual ::placeholder cascade and rendered text geometry.
const getComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element, pseudoElement) =>
  getComputedStyle(element, pseudoElement === '::placeholder' ? undefined : pseudoElement);

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
