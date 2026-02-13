// Mock ResizeObserver for tests
// ResizeObserver is now widely supported but not available in jsdom test environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
