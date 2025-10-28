/**
 * 组件库测试工具
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

// 测试提供者组件包装器
interface AllTheProvidersProps {
  children: ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return <div data-testid="test-provider">{children}</div>
}

// 自定义渲染函数，包含所有必要的提供者
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// 重新导出所有测试工具
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// 手动导入 jest-dom 的匹配器，避免类型问题
import '@testing-library/jest-dom'

// 导出自定义渲染函数
export { customRender as render }

// 测试用的mock数据
export const mockComponentProps = {
  id: 'test-component-1',
  isSelected: false,
  isDragging: false,
  onSelect: jest.fn(),
  onDelete: jest.fn(),
  onUpdate: jest.fn(),
  props: {},
  styles: {},
  children: null,
}

export const mockButtonProps = {
  ...mockComponentProps,
  props: {
    button: {
      text: 'Test Button',
      variant: 'default' as const,
      size: 'default' as const,
      disabled: false,
    },
  },
}

export const mockInputProps = {
  ...mockComponentProps,
  props: {
    input: {
      label: 'Test Input',
      placeholder: 'Enter text...',
      type: 'text' as const,
      required: false,
      disabled: false,
      readonly: false,
    },
  },
}

export const mockTextProps = {
  ...mockComponentProps,
  props: {
    text: {
      content: 'Test Text Content',
      variant: 'body' as const,
      size: 'base' as const,
      weight: 'normal' as const,
      align: 'left' as const,
      decoration: 'none' as const,
    },
  },
}

export const mockContainerProps = {
  ...mockComponentProps,
  props: {
    container: {
      direction: 'column' as const,
      wrap: false,
      justify: 'start' as const,
      align: 'start' as const,
      gap: 0,
      padding: { x: 0, y: 0 },
      margin: { x: 0, y: 0 },
    },
  },
}

// 测试辅助函数
export const expectComponentToExist = (componentId: string) => {
  const element = document.querySelector(`[data-component-id="${componentId}"]`)
  expect(element).toBeInTheDocument()
}

export const expectComponentToBeSelected = (componentId: string) => {
  const element = document.querySelector(`[data-component-id="${componentId}"]`)
  expect(element).toHaveClass('ring-2', 'ring-blue-500', 'ring-offset-2')
}

export const expectComponentToBeDragging = (componentId: string) => {
  const element = document.querySelector(`[data-component-id="${componentId}"]`)
  expect(element).toHaveClass('opacity-75')
}

export const simulateDragStart = (element: HTMLElement) => {
  const dragStartEvent = new Event('dragstart', { bubbles: true })
  element.dispatchEvent(dragStartEvent)
}

export const simulateClick = (element: HTMLElement) => {
  const clickEvent = new MouseEvent('click', { bubbles: true })
  element.dispatchEvent(clickEvent)
}

export const simulateDoubleClick = (element: HTMLElement) => {
  const doubleClickEvent = new MouseEvent('dblclick', { bubbles: true })
  element.dispatchEvent(doubleClickEvent)
}
