// Mock ResizeObserver for tests
// ResizeObserver is now widely supported but not available in jsdom test environment
const { TextDecoder, TextEncoder } = require('node:util');

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
