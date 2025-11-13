/**
 * 设计器测试设置文件
 */

import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// 配置Testing Library
configure({
  testIdAttribute: 'data-testid',
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock UUID generation
jest.mock('crypto', () => ({
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}))

export {}