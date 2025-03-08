import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockImplementation(async () => new Uint8Array(32))
    }
  }
})

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })
)

// Mock postMessage
window.postMessage = jest.fn()

// Mock requestAnimationFrame
window.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0))

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

window.ResizeObserver = MockResizeObserver

// Mock HTMLCanvasElement methods
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  drawImage: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 }))
}))

// Setup test environment
beforeAll(() => {
  // Clear all mocks before each test suite
  jest.clearAllMocks()
  
  // Mock console methods to avoid noise in test output
  jest.spyOn(console, 'log').mockImplementation()
  jest.spyOn(console, 'error').mockImplementation()
  jest.spyOn(console, 'warn').mockImplementation()
})

afterEach(() => {
  // Clear all timers
  jest.clearAllTimers()
  
  // Clear localStorage
  localStorageMock.clear()
  
  // Reset fetch mock
  ;(global.fetch as jest.Mock).mockClear()
  
  // Reset postMessage mock
  ;(window.postMessage as jest.Mock).mockClear()
})

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks()
})