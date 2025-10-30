/**
 * 测试工具和辅助函数
 */

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
// import { vi } from 'vitest'

// 创建真实的UI组件Mock
export function createMockUIComponent(componentName: string, defaultProps: Record<string, unknown> = {}) {
  const MockComponent = ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
    <div
      data-testid={`mock-${componentName.toLowerCase()}`}
      className={className}
      data-component={componentName}
      {...defaultProps}
      {...props}
    >
      {children}
    </div>
  )

  MockComponent.displayName = `Mock${componentName}`
  return MockComponent
}

// 创建SVG图标的Mock
export function createMockIcon(iconName: string) {
  const MockIcon = ({ size = 24, className, ...props }: { size?: number | string; className?: string; [key: string]: unknown }) => (
    <svg
      data-testid={`mock-icon-${iconName.toLowerCase()}`}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <title>{iconName}</title>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
    </svg>
  )

  MockIcon.displayName = `Mock${iconName}Icon`
  return MockIcon
}

// 布局组件的Mock集合
export const LayoutComponentMocks = {
  Container: createMockUIComponent('Container', {
    'data-fluid': false,
    'data-max-width': null,
  }),
  Row: createMockUIComponent('Row', {
    'data-gutter': 0,
    'data-justify': 'start',
    'data-align': 'top',
    'data-wrap': false,
  }),
  Col: createMockUIComponent('Col', {
    'data-span': 24,
    'data-offset': 0,
  }),
  Divider: createMockUIComponent('Divider', {
    'data-orientation': 'horizontal',
    'data-dashed': false,
    'data-plain': false,
  }),
  Spacer: createMockUIComponent('Spacer', {
    'data-size': 'medium',
    'data-direction': 'vertical',
  }),
}

// 增强的渲染函数，支持主题和国际化
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions = {}
) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <div data-testid="test-wrapper" className="test-environment">
        {children}
      </div>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// 组件属性测试辅助函数
export function testComponentProps(
  Component: React.ComponentType<Record<string, unknown>>,
  requiredProps: Record<string, unknown>,
  propName: string,
  testValues: unknown[]
) {
  describe(`${propName} 属性测试`, () => {
    testValues.forEach(value => {
      it(`应该支持 ${propName} = ${JSON.stringify(value)}`, () => {
        const props = { ...requiredProps, [propName]: value }

        expect(() => {
          renderWithProviders(<Component {...props} />)
        }).not.toThrow()
      })
    })
  })
}

// 可访问性测试辅助函数
export function testAccessibility(
  component: React.ReactElement,
  requiredRoles: string[] = [],
  requiredLabels: string[] = []
) {
  describe('可访问性测试', () => {
    requiredRoles.forEach(role => {
      it(`应该有正确的 role="${role}" 属性`, () => {
        const { container } = renderWithProviders(component)
        const element = container.querySelector(`[role="${role}"]`)
        expect(element).toBeInTheDocument()
      })
    })

    requiredLabels.forEach(label => {
      it(`应该有包含 "${label}" 的可访问性标签`, () => {
        const { container } = renderWithProviders(component)
        const element = container.querySelector('[aria-label], [aria-labelledby], [title]')
        expect(element?.textContent || element?.getAttribute('aria-label') || element?.getAttribute('title')).toMatch(new RegExp(label, 'i'))
      })
    })

    it('应该没有可访问性警告', () => {
      const { container } = renderWithProviders(component)

      // 检查是否有aria-hidden的交互元素
      const hiddenInteractiveElements = container.querySelectorAll(
        '[aria-hidden="true"]:is(button, a, input, select, textarea, [tabindex])'
      )
      expect(hiddenInteractiveElements).toHaveLength(0)
    })
  })
}

// 响应式测试辅助函数
export function testResponsiveBehavior(
  Component: React.ComponentType<Record<string, unknown>>,
  props: Record<string, unknown>,
  breakpoints: { name: string; width: number }[] = [
    { name: 'mobile', width: 375 },
    { name: 'tablet', width: 768 },
    { name: 'desktop', width: 1024 },
  ]
) {
  describe('响应式行为测试', () => {
    breakpoints.forEach(({ name, width }) => {
      it(`在 ${name} (${width}px) 屏幕宽度下应该正常渲染`, () => {
        // 模拟窗口宽度
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        })

        expect(() => {
          renderWithProviders(<Component {...props} />)
        }).not.toThrow()
      })
    })
  })
}

// 性能测试辅助函数
export function testComponentPerformance(
  Component: React.ComponentType<Record<string, unknown>>,
  props: Record<string, unknown>,
  maxRenderTime: number = 16 // 60fps
) {
  it('应该在合理时间内完成渲染', async () => {
    const startTime = performance.now()

    renderWithProviders(<Component {...props} />)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    expect(renderTime).toBeLessThan(maxRenderTime)
  })
}

// 边界情况测试辅助函数
export function testEdgeCases(
  Component: React.ComponentType<Record<string, unknown>>,
  baseProps: Record<string, unknown>,
  edgeProps: Record<string, unknown>[]
) {
  describe('边界情况测试', () => {
    edgeProps.forEach((props, index) => {
      it(`应该处理边界情况 ${index + 1}: ${JSON.stringify(props)}`, () => {
        const testProps = { ...baseProps, ...props }

        expect(() => {
          renderWithProviders(<Component {...testProps} />)
        }).not.toThrow()
      })
    })

    it('应该处理空属性', () => {
      expect(() => {
        renderWithProviders(<Component {...baseProps} />)
      }).not.toThrow()
    })

    it('应该处理未定义的属性', () => {
      expect(() => {
        renderWithProviders(<Component {...baseProps} unknown-prop="test" />)
      }).not.toThrow()
    })
  })
}

// Mock自定义Hook - 注释掉，因为vitest不可用
// export function createMockHook<T extends (...args: unknown[]) => unknown>(
//   hookImplementation: T
// ): T {
//   return vi.fn(hookImplementation) as T
// }

// 创建测试用组件数据
export function createTestComponent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-component-id',
    type: 'test-component',
    name: '测试组件',
    description: '用于测试的组件',
    defaultProps: {},
    configurable: {},
    styles: {},
    ...overrides,
  }
}

// 创建 ComponentRendererProps 的测试数据
export function createTestRendererProps(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-component-id',
    type: 'col' as const,
    props: {
      col: {
        span: 12,
        offset: 0,
        order: 0,
        flex: undefined,
        flexGrow: undefined,
        flexShrink: undefined,
        flexBasis: undefined,
        alignSelf: undefined,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
      },
      ...overrides,
    },
    styles: {},
    events: {},
    responsive: undefined,
    isSelected: false,
    isHovered: false,
    isDragging: false,
    readonly: false,
    onSelect: undefined,
    onUpdate: undefined,
    onDelete: undefined,
    children: undefined,
    ...overrides,
  }
}

// 为布局组件创建测试 props 的辅助函数
export function createLayoutTestProps(componentType: 'container' | 'row' | 'col' | 'divider' | 'spacer', specificProps: Record<string, unknown> = {}, overrides: Record<string, unknown> = {}) {
  const baseProps = createTestRendererProps({
    type: componentType,
    props: {
      [componentType]: specificProps,
    },
    ...overrides,
  })
  return baseProps
}