/**
 * 测试类型定义文件
 * 为Jest matcher和其他测试工具提供类型支持
 */

import '@testing-library/jest-dom'

// Vitest支持
declare module 'vitest' {
  export interface Assertion<T = unknown> {
    toBeInTheDocument(): T
    toHaveAttribute(attr: string, value?: string): T
    toHaveTextContent(text: string | RegExp): T
    toBeVisible(): T
    toBeDisabled(): T
    toBeEnabled(): T
    toHaveClass(...className: string[]): T
    toHaveStyle(style: Record<string, string>): T
    toHaveValue(value: string | string[]): T
    toBeChecked(): T
    toHaveFocus(): T
    toBeEmptyDOMElement(): T
    toContainElement(element: HTMLElement | null): T
    toContainHTML(html: string): T
    toHaveDescription(text: string | RegExp): T
    toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): T
    toHaveErrorMessage(text: string | RegExp): T
    toHaveFormValues(values: Record<string, unknown>): T
    toHaveRole(role: string): T
    toHaveAccessibleDescription(): T
    toHaveAccessibleName(): T
  }
}

export {}
