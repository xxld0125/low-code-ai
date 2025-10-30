/**
 * 测试类型定义文件
 * 为Jest matcher和其他测试工具提供类型支持
 */

import '@testing-library/jest-dom'

// 扩展Jest matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveClass(...className: string[]): R
      toHaveStyle(style: Record<string, any>): R
      toHaveValue(value: any): R
      toBeChecked(): R
      toHaveFocus(): R
      toBeEmptyDOMElement(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveDescription(text: string | RegExp): R
      toHaveDisplayValue(value: any): R
      toHaveErrorMessage(text: string | RegExp): R
      toHaveFormValues(values: Record<string, any>): R
      toHaveRole(role: string): R
      toHaveAccessibleDescription(): R
      toHaveAccessibleName(): R
    }
  }
}

// Vitest支持
declare module 'vitest' {
  export interface Assertion<T = any> extends jest.Matchers<T> {}
}

export {}