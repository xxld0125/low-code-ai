# 低代码平台组件库测试策略与最佳实践

## 概述

本文档详细描述了全栈低代码开发平台组件库的测试策略，包括单元测试、集成测试、E2E测试、性能测试和可访问性测试的最佳实践。

## 1. 测试架构概览

### 1.1 测试金字塔

```
    /\
   /  \     E2E Tests (少量，高价值)
  /____\
 /      \   Integration Tests (适量，关键流程)
/__________\ Unit Tests (大量，快速反馈)
```

### 1.2 当前测试工具栈

- **单元测试**: Jest + React Testing Library + @testing-library/user-event
- **集成测试**: Jest + React Testing Library
- **E2E测试**: 待引入 Playwright
- **性能测试**: 待引入 Lighthouse CI
- **可访问性测试**: @testing-library/jest-dom + axe-core

## 2. 单元测试策略

### 2.1 测试覆盖范围

#### 2.1.1 组件渲染测试

- 组件基本渲染功能
- 属性传递和显示
- 默认值处理
- 边界条件处理

#### 2.1.2 属性配置测试

- 必需属性验证
- 可选属性默认值
- 属性类型验证
- 属性变化响应

#### 2.1.3 事件响应测试

- 点击事件处理
- 键盘事件处理
- 表单事件处理
- 自定义事件触发

### 2.2 基础组件单元测试示例

#### Button组件测试用例

```typescript
// tests/components/lowcode/page-basic/PageButton.test.tsx
import { describe, test, expect, jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageButton } from '@/components/lowcode/page-basic/PageButton'
import { ComponentRendererProps } from '@/types/page-designer/component'

describe('PageButton', () => {
  const defaultProps: ComponentRendererProps = {
    id: 'test-button',
    type: 'button',
    props: {
      button: {
        text: '测试按钮',
        variant: 'primary',
        size: 'md',
        disabled: false,
      }
    },
    styles: {},
    events: {},
  }

  describe('渲染测试', () => {
    test('应该正确渲染基础按钮', () => {
      render(<PageButton {...defaultProps} />)

      const button = screen.getByRole('button', { name: '测试按钮' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('data-component-type', 'button')
      expect(button).toHaveAttribute('data-component-id', 'test-button')
    })

    test('应该支持不同的按钮变体', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'link'] as const

      variants.forEach(variant => {
        const props = {
          ...defaultProps,
          props: {
            button: {
              ...defaultProps.props.button!,
              variant
            }
          }
        }

        const { container } = render(<PageButton {...props} />)
        // 验证不同变体的样式类
        expect(container.firstChild).toMatchSnapshot()
      })
    })

    test('应该支持不同的尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach(size => {
        const props = {
          ...defaultProps,
          props: {
            button: {
              ...defaultProps.props.button!,
              size
            }
          }
        }

        render(<PageButton {...props} />)
        const button = screen.getByRole('button')
        // 验证尺寸相关的样式类
        expect(button).toBeInTheDocument()
      })
    })

    test('应该显示图标', () => {
      const props = {
        ...defaultProps,
        props: {
          button: {
            ...defaultProps.props.button!,
            icon: '🚀',
            icon_position: 'left'
          }
        }
      }

      render(<PageButton {...props} />)
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('🚀测试按钮')
    })

    test('应该支持加载状态', () => {
      const props = {
        ...defaultProps,
        props: {
          button: {
            ...defaultProps.props.button!,
            loading: true
          }
        }
      }

      render(<PageButton {...props} />)
      const spinner = screen.getByRole('status') || document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    test('应该正确处理禁用状态', () => {
      const props = {
        ...defaultProps,
        props: {
          button: {
            ...defaultProps.props.button!,
            disabled: true
          }
        }
      }

      render(<PageButton {...props} />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('事件处理测试', () => {
    test('应该处理点击事件', async () => {
      const mockOnSelect = jest.fn()
      const user = userEvent.setup()

      const props = {
        ...defaultProps,
        onSelect: mockOnSelect
      }

      render(<PageButton {...props} />)
      const button = screen.getByRole('button')

      await user.click(button)
      expect(mockOnSelect).toHaveBeenCalledWith('test-button')
    })

    test('应该处理双击事件', async () => {
      const user = userEvent.setup()

      render(<PageButton {...defaultProps} />)
      const button = screen.getByRole('button')

      await user.dblClick(button)
      // 验证双击行为，可能触发编辑模式
    })

    test('应该处理键盘事件', async () => {
      const mockOnDelete = jest.fn()
      const user = userEvent.setup()

      const props = {
        ...defaultProps,
        onDelete: mockOnDelete,
        isSelected: true
      }

      render(<PageButton {...props} />)
      const button = screen.getByRole('button')

      button.focus()
      await user.keyboard('{Delete}')
      expect(mockOnDelete).toHaveBeenCalledWith('test-button')
    })
  })

  describe('样式测试', () => {
    test('应该应用自定义样式', () => {
      const props = {
        ...defaultProps,
        styles: {
          width: '200px',
          height: '50px',
          backgroundColor: '#ff0000',
          borderRadius: '8px'
        }
      }

      render(<PageButton {...props} />)
      const button = screen.getByRole('button')

      expect(button).toHaveStyle({
        width: '200px',
        height: '50px',
        backgroundColor: '#ff0000'
      })
    })

    test('应该显示选中状态', () => {
      const props = {
        ...defaultProps,
        isSelected: true
      }

      render(<PageButton {...props} />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('ring-2', 'ring-blue-500')
    })

    test('应该显示拖拽状态', () => {
      const props = {
        ...defaultProps,
        isDragging: true
      }

      render(<PageButton {...props} />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('opacity-75')
    })
  })

  describe('可访问性测试', () => {
    test('应该有正确的ARIA标签', () => {
      render(<PageButton {...defaultProps} />)
      const button = screen.getByRole('button', { name: '测试按钮' })
      expect(button).toHaveAttribute('aria-label', '测试按钮')
    })

    test('应该支持键盘导航', async () => {
      const user = userEvent.setup()

      render(<PageButton {...defaultProps} />)
      const button = screen.getByRole('button')

      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      // 验证Enter键触发点击事件

      await user.keyboard(' ')
      // 验证空格键触发点击事件
    })
  })
})
```

#### Input组件测试用例

```typescript
// tests/components/lowcode/page-basic/PageInput.test.tsx
import { describe, test, expect, jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageInput } from '@/components/lowcode/page-basic/PageInput'

describe('PageInput', () => {
  const defaultProps = {
    id: 'test-input',
    type: 'input',
    props: {
      input: {
        type: 'text',
        placeholder: '请输入内容',
        value: '',
        required: false,
        disabled: false,
        readOnly: false,
      }
    },
    styles: {},
    events: {},
  }

  describe('基础渲染', () => {
    test('应该渲染输入框', () => {
      render(<PageInput {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入内容')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    test('应该支持不同的输入类型', () => {
      const types = ['text', 'email', 'password', 'number', 'tel', 'url'] as const

      types.forEach(type => {
        const props = {
          ...defaultProps,
          props: {
            input: {
              ...defaultProps.props.input!,
              type
            }
          }
        }

        render(<PageInput {...props} />)
        const input = screen.getByDisplayValue('')
        expect(input).toHaveAttribute('type', type)
      })
    })
  })

  describe('输入验证', () => {
    test('应该验证必填字段', async () => {
      const props = {
        ...defaultProps,
        props: {
          input: {
            ...defaultProps.props.input!,
            required: true,
            label: '用户名'
          }
        }
      }

      render(<PageInput {...props} />)
      const input = screen.getByLabelText('用户名')

      // 测试必填验证
      await userEvent.type(input, 'test')
      await userEvent.clear(input)

      expect(input).toBeInvalid()
    })

    test('应该验证最大长度', async () => {
      const props = {
        ...defaultProps,
        props: {
          input: {
            ...defaultProps.props.input!,
            maxlength: 5
          }
        }
      }

      render(<PageInput {...props} />)
      const input = screen.getByPlaceholderText('请输入内容')

      await userEvent.type(input, '123456789')
      expect(input).toHaveValue('12345')
    })

    test('应该验证模式匹配', async () => {
      const props = {
        ...defaultProps,
        props: {
          input: {
            ...defaultProps.props.input!,
            pattern: '[a-z]+',
            label: '小写字母'
          }
        }
      }

      render(<PageInput {...props} />)
      const input = screen.getByLabelText('小写字母')

      await userEvent.type(input, 'ABC')
      expect(input).toBeInvalid()

      await userEvent.clear(input)
      await userEvent.type(input, 'abc')
      expect(input).toBeValid()
    })
  })
})
```

### 2.3 布局组件测试

#### Container组件测试

```typescript
// tests/components/lowcode/page-layout/Container.test.tsx
describe('Container', () => {
  describe('布局功能', () => {
    test('应该支持flex布局', () => {
      const props = {
        ...defaultProps,
        props: {
          container: {
            direction: 'row',
            wrap: true,
            justify: 'center',
            align: 'center',
            gap: 16
          }
        }
      }

      render(<Container {...props} />)
      const container = screen.getByTestId('container')

      expect(container).toHaveStyle({
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px'
      })
    })

    test('应该支持响应式间距', () => {
      const props = {
        ...defaultProps,
        props: {
          container: {
            padding: { xs: 8, md: 16, lg: 24 },
            margin: { top: 16, bottom: 16 }
          }
        }
      }

      render(<Container {...props} />)
      // 验证响应式样式应用
    })
  })

  describe('子组件渲染', () => {
    test('应该正确渲染子组件', () => {
      const children = [
        { type: 'button', id: 'btn1', props: { button: { text: '按钮1' } } },
        { type: 'input', id: 'input1', props: { input: { placeholder: '输入框' } } }
      ]

      render(
        <Container {...defaultProps}>
          {children.map(child => (
            <ComponentRenderer key={child.id} component={child} />
          ))}
        </Container>
      )

      expect(screen.getByText('按钮1')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('输入框')).toBeInTheDocument()
    })
  })
})
```

### 2.4 测试工具函数

#### 组件测试工具

```typescript
// tests/utils/component-test-utils.tsx
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { ComponentRendererProps } from '@/types/page-designer/component'

// 自定义渲染器，包含主题提供者
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// 创建模拟组件属性
export const createMockComponentProps = (
  overrides: Partial<ComponentRendererProps> = {}
): ComponentRendererProps => ({
  id: 'test-component',
  type: 'button',
  props: {},
  styles: {},
  events: {},
  ...overrides
})

// 模拟拖拽事件
export const createDragEvent = (type: string) => {
  const event = new Event(type, { bubbles: true })
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      setData: jest.fn(),
      getData: jest.fn(),
    },
  })
  return event
}

// 等待异步操作完成
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

export * from '@testing-library/react'
export { customRender as render }
```

## 3. 集成测试策略

### 3.1 组件间交互测试

#### 拖拽操作集成测试

```typescript
// tests/integration/drag-drop.test.tsx
import { describe, test, expect, jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentPanel } from '@/components/designer/ComponentPanel'
import { Canvas } from '@/components/designer/Canvas'
import { DragProvider } from '@/contexts/DragContext'

describe('拖拽操作集成测试', () => {
  test('应该能够从组件面板拖拽组件到画布', async () => {
    const user = userEvent.setup()
    const mockOnDrop = jest.fn()

    render(
      <DragProvider onDrop={mockOnDrop}>
        <div>
          <ComponentPanel />
          <Canvas />
        </div>
      </DragProvider>
    )

    // 查找按钮组件
    const buttonComponent = screen.getByText('按钮')

    // 开始拖拽
    fireEvent.dragStart(buttonComponent)

    // 查找画布拖拽区域
    const canvasDropZone = screen.getByTestId('canvas-drop-zone')

    // 拖拽到画布
    fireEvent.dragOver(canvasDropZone)
    fireEvent.drop(canvasDropZone)

    // 验证拖拽结果
    await waitFor(() => {
      expect(mockOnDrop).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'button',
          isFromPanel: true
        }),
        expect.objectContaining({
          targetId: 'canvas'
        })
      )
    })
  })

  test('应该能够重新排列画布中的组件', async () => {
    const user = userEvent.setup()

    render(
      <DragProvider>
        <Canvas>
          <div data-testid="component-1">组件1</div>
          <div data-testid="component-2">组件2</div>
        </Canvas>
      </DragProvider>
    )

    const component1 = screen.getByTestId('component-1')
    const component2 = screen.getByTestId('component-2')

    // 拖拽组件1到组件2位置
    fireEvent.dragStart(component1)
    fireEvent.dragOver(component2)
    fireEvent.drop(component2)

    // 验证组件顺序已改变
    expect(component2.nextSibling).toBe(component1)
  })
})
```

#### 属性面板集成测试

```typescript
// tests/integration/properties-panel.test.tsx
import { describe, test, expect, jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertiesPanel } from '@/components/designer/PropertiesPanel'
import { ComponentProvider } from '@/contexts/ComponentContext'

describe('属性面板集成测试', () => {
  const mockComponent = {
    id: 'test-button',
    type: 'button',
    props: {
      button: {
        text: '原始文本',
        variant: 'primary',
        size: 'md'
      }
    },
    styles: {}
  }

  test('应该能够修改组件属性', async () => {
    const user = userEvent.setup()
    const mockOnUpdate = jest.fn()

    render(
      <ComponentProvider>
        <PropertiesPanel
          selectedComponent={mockComponent}
          onUpdate={mockOnUpdate}
        />
      </ComponentProvider>
    )

    // 修改按钮文本
    const textInput = screen.getByLabelText('按钮文本')
    await user.clear(textInput)
    await user.type(textInput, '新文本')

    // 修改按钮变体
    const variantSelect = screen.getByLabelText('按钮样式')
    await user.selectOptions(variantSelect, 'secondary')

    // 验证更新回调
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('test-button', {
        props: {
          button: {
            text: '新文本',
            variant: 'secondary',
            size: 'md'
          }
        }
      })
    })
  })

  test('应该实时预览样式变化', async () => {
    const user = userEvent.setup()

    render(
      <ComponentProvider>
        <PropertiesPanel selectedComponent={mockComponent} />
      </ComponentProvider>
    )

    // 修改背景颜色
    const colorInput = screen.getByLabelText('背景颜色')
    await user.type(colorInput, '#ff0000')

    // 验证预览组件样式已更新
    const previewComponent = screen.getByTestId('component-preview')
    expect(previewComponent).toHaveStyle({
      backgroundColor: '#ff0000'
    })
  })
})
```

### 3.2 状态管理集成测试

```typescript
// tests/integration/state-management.test.tsx
import { describe, test, expect, jest } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'
import { useDesignerStore } from '@/stores/designer'

describe('状态管理集成测试', () => {
  test('应该正确管理组件列表', () => {
    const { result } = renderHook(() => useDesignerStore())

    // 初始状态
    expect(result.current.components).toEqual({})

    // 添加组件
    const component = {
      id: 'btn-1',
      type: 'button',
      props: { button: { text: '按钮' } },
      styles: {},
    }

    act(() => {
      result.current.addComponent(component)
    })

    expect(result.current.components['btn-1']).toEqual(component)

    // 更新组件
    act(() => {
      result.current.updateComponent('btn-1', {
        props: { button: { text: '更新的按钮' } },
      })
    })

    expect(result.current.components['btn-1'].props.button.text).toBe('更新的按钮')

    // 删除组件
    act(() => {
      result.current.deleteComponent('btn-1')
    })

    expect(result.current.components['btn-1']).toBeUndefined()
  })

  test('应该正确管理选中状态', () => {
    const { result } = renderHook(() => useDesignerStore())

    // 选择组件
    act(() => {
      result.current.selectComponent('btn-1')
    })

    expect(result.current.selectedComponentId).toBe('btn-1')

    // 清除选择
    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.selectedComponentId).toBeNull()
  })
})
```

## 4. E2E测试策略

### 4.1 Playwright配置

#### 安装和配置

```bash
# 安装 Playwright
pnpm add -D @playwright/test

# 安装浏览器
pnpm exec playwright install
```

#### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 4.2 E2E测试用例

#### 完整页面设计流程测试

```typescript
// tests/e2e/page-design-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('页面设计工作流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // 导航到页面设计器
    await page.goto('/protected/designer')
    await page.waitForLoadState('networkidle')
  })

  test('完整的页面设计流程', async ({ page }) => {
    // 1. 创建新页面
    await page.click('[data-testid="new-page-button"]')
    await page.fill('[data-testid="page-name-input"]', '测试页面')
    await page.click('[data-testid="create-page-button"]')

    // 2. 拖拽组件到画布
    await page.dragAndDrop('[data-testid="component-button"]', '[data-testid="canvas-drop-zone"]')

    // 3. 选择并配置组件
    await page.click('[data-component-id="button-1"]')
    await page.fill('[data-testid="button-text-input"]', '点击我')
    await page.selectOption('[data-testid="button-variant-select"]', 'primary')

    // 4. 添加更多组件
    await page.dragAndDrop('[data-testid="component-input"]', '[data-testid="canvas-drop-zone"]')

    // 5. 配置输入框
    await page.click('[data-component-id="input-1"]')
    await page.fill('[data-testid="input-placeholder-input"]', '请输入姓名')

    // 6. 预览页面
    await page.click('[data-testid="preview-button"]')
    await page.waitForSelector('[data-testid="preview-mode"]')

    // 7. 验证预览内容
    await expect(page.locator('button:has-text("点击我")')).toBeVisible()
    await expect(page.locator('input[placeholder="请输入姓名"]')).toBeVisible()

    // 8. 返回编辑模式
    await page.click('[data-testid="edit-button"]')

    // 9. 保存页面
    await page.click('[data-testid="save-button"]')
    await expect(page.locator('[data-testid="save-success-message"]')).toBeVisible()
  })

  test('组件拖拽和定位', async ({ page }) => {
    // 拖拽按钮到画布
    await page.dragAndDrop('[data-testid="component-button"]', '[data-testid="canvas-drop-zone"]')

    // 验证组件已添加到画布
    const button = page.locator('[data-component-id="button-1"]')
    await expect(button).toBeVisible()

    // 测试组件定位
    const boundingBox = await button.boundingBox()
    expect(boundingBox).toBeTruthy()
    expect(boundingBox!.x).toBeGreaterThan(0)
    expect(boundingBox!.y).toBeGreaterThan(0)

    // 测试组件移动
    await button.hover()
    await page.mouse.down()
    await page.mouse.move(boundingBox!.x + 100, boundingBox!.y + 50)
    await page.mouse.up()

    // 验证新位置
    const newBoundingBox = await button.boundingBox()
    expect(newBoundingBox!.x).toBeGreaterThan(boundingBox!.x)
    expect(newBoundingBox!.y).toBeGreaterThan(boundingBox!.y)
  })

  test('属性面板配置', async ({ page }) => {
    // 添加组件
    await page.dragAndDrop('[data-testid="component-button"]', '[data-testid="canvas-drop-zone"]')

    // 选择组件
    await page.click('[data-component-id="button-1"]')

    // 等待属性面板加载
    await page.waitForSelector('[data-testid="properties-panel"]')

    // 配置文本
    await page.fill('[data-testid="button-text-input"]', '动态按钮')
    await expect(page.locator('[data-component-id="button-1"]')).toContainText('动态按钮')

    // 配置样式
    await page.click('[data-testid="styles-tab"]')
    await page.fill('[data-testid="width-input"]', '200px')
    await page.fill('[data-testid="height-input"]', '60px')

    // 验证样式应用
    const button = page.locator('[data-component-id="button-1"]')
    await expect(button).toHaveCSS('width', '200px')
    await expect(button).toHaveCSS('height', '60px')

    // 配置事件
    await page.click('[data-testid="events-tab"]')
    await page.click('[data-testid="add-event-button"]')
    await page.selectOption('[data-testid="event-type-select"]', 'click')
    await page.selectOption('[data-testid="event-action-select"]', 'navigate')
    await page.fill('[data-testid="event-target-input"]', '/about')

    // 验证事件配置
    await expect(page.locator('[data-testid="event-list"]')).toContainText(
      'click → navigate → /about'
    )
  })

  test('响应式设计', async ({ page }) => {
    // 添加容器和组件
    await page.dragAndDrop(
      '[data-testid="component-container"]',
      '[data-testid="canvas-drop-zone"]'
    )

    await page.dragAndDrop('[data-testid="component-button"]', '[data-component-id="container-1"]')

    // 配置桌面视图
    await page.selectOption('[data-testid="viewport-select"]', 'desktop')
    await page.click('[data-component-id="button-1"]')
    await page.fill('[data-testid="width-input"]', '300px')

    // 配置平板视图
    await page.selectOption('[data-testid="viewport-select"]', 'tablet')
    await page.fill('[data-testid="width-input"]', '200px')

    // 配置手机视图
    await page.selectOption('[data-testid="viewport-select"]', 'mobile')
    await page.fill('[data-testid="width-input"]', '100%')

    // 验证响应式预览
    await page.click('[data-testid="preview-button"]')

    // 测试不同视口尺寸
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('[data-component-id="button-1"]')).toHaveCSS('width', '300px')

    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('[data-component-id="button-1"]')).toHaveCSS('width', '200px')

    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-component-id="button-1"]')).toHaveCSS('width', '100%')
  })
})
```

#### 性能测试用例

```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('性能测试', () => {
  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/protected/designer')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // 页面应在3秒内加载完成

    // 检查性能指标
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime,
      }
    })

    expect(metrics.domContentLoaded).toBeLessThan(1500)
    expect(metrics.loadComplete).toBeLessThan(3000)
    expect(metrics.firstContentfulPaint).toBeLessThan(1000)
  })

  test('大量组件渲染性能', async ({ page }) => {
    await page.goto('/protected/designer')

    // 添加大量组件
    for (let i = 0; i < 100; i++) {
      await page.dragAndDrop('[data-testid="component-button"]', '[data-testid="canvas-drop-zone"]')
    }

    // 测量渲染时间
    const renderStartTime = Date.now()
    await page.waitForSelector('[data-component-id="button-100"]')
    const renderTime = Date.now() - renderStartTime

    expect(renderTime).toBeLessThan(5000) // 100个组件应在5秒内渲染完成

    // 测试拖拽性能
    const dragStartTime = Date.now()
    await page.dragAndDrop('[data-component-id="button-1"]', '[data-testid="canvas-drop-zone"]')
    const dragTime = Date.now() - dragStartTime

    expect(dragTime).toBeLessThan(1000) // 拖拽响应应在1秒内
  })

  test('内存使用测试', async ({ page }) => {
    await page.goto('/protected/designer')

    // 获取初始内存使用
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // 执行一系列操作
    for (let i = 0; i < 50; i++) {
      await page.dragAndDrop('[data-testid="component-button"]', '[data-testid="canvas-drop-zone"]')
      await page.click(`[data-component-id="button-${i + 1}"]`)
      await page.click('[data-testid="preview-button"]')
      await page.click('[data-testid="edit-button"]')
    }

    // 强制垃圾回收
    await page.evaluate(() => {
      if (window.gc) {
        window.gc()
      }
    })

    // 检查内存增长
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    const memoryGrowth = finalMemory - initialMemory
    const memoryGrowthMB = memoryGrowth / 1024 / 1024

    expect(memoryGrowthMB).toBeLessThan(50) // 内存增长应小于50MB
  })
})
```

#### 可访问性测试用例

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('可访问性测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/protected/designer')
    await injectAxe(page)
  })

  test('基础可访问性检查', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      rules: {
        // 允许的颜色对比度警告（因为这是设计工具）
        'color-contrast': { enabled: false },
        // 允许的跳过链接警告
        'skip-link': { enabled: false },
      },
    })
  })

  test('键盘导航测试', async ({ page }) => {
    // 测试Tab键导航
    await page.keyboard.press('Tab')
    let focused = await page.locator(':focus')
    await expect(focused).toBeVisible()

    // 继续Tab导航到各个元素
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      focused = await page.locator(':focus')
      await expect(focused).toBeVisible()
    }

    // 测试Shift+Tab反向导航
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab')
      focused = await page.locator(':focus')
      await expect(focused).toBeVisible()
    }

    // 测试Enter键激活
    await page.keyboard.press('Enter')

    // 测试空格键激活
    await page.keyboard.press('Space')
  })

  test('屏幕阅读器支持', async ({ page }) => {
    // 添加一个按钮组件
    await page.dragAndDrop('[data-testid="component-button"]', '[data-testid="canvas-drop-zone"]')

    // 检查ARIA标签
    const button = page.locator('[data-component-id="button-1"]')
    await expect(button).toHaveAttribute('role', 'button')
    await expect(button).toHaveAttribute('aria-label')

    // 检查组件结构的语义化
    const main = page.locator('main')
    await expect(main).toBeVisible()

    const navigation = page.locator('nav')
    await expect(navigation).toBeVisible()
  })

  test('焦点管理测试', async ({ page }) => {
    // 添加组件并选择
    await page.dragAndDrop('[data-testid="component-button"]', '[data-testid="canvas-drop-zone"]')
    await page.click('[data-component-id="button-1"]')

    // 验证焦点在选中的组件上
    const focused = await page.locator(':focus')
    await expect(focused).toBe('[data-component-id="button-1"]')

    // 测试模态框焦点管理
    await page.click('[data-testid="settings-button"]')
    const modal = page.locator('[data-testid="settings-modal"]')
    await expect(modal).toBeVisible()

    // 焦点应该在模态框内
    const modalFocused = await page.locator(':focus')
    await expect(modalFocused).toBeWithin(modal)

    // 关闭模态框，焦点应返回原元素
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
    const restoredFocus = await page.locator(':focus')
    await expect(restoredFocus).toBe('[data-component-id="button-1"]')
  })

  test('颜色和对比度测试', async ({ page }) => {
    // 检查主题切换
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      await page.waitForTimeout(500) // 等待主题切换动画

      // 再次检查可访问性
      await checkA11y(page, null, {
        rules: {
          // 启用颜色对比度检查
          'color-contrast': { enabled: true },
        },
      })
    }
  })
})
```

## 5. 性能测试策略

### 5.1 组件渲染性能测试

```typescript
// tests/performance/component-rendering.test.ts
import { describe, test, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { PerformanceObserver } from 'perf_hooks'

describe('组件渲染性能测试', () => {
  test('Button组件渲染性能', () => {
    const startTime = performance.now()

    // 渲染1000个按钮
    const buttons = Array.from({ length: 1000 }, (_, i) => (
      <PageButton
        key={i}
        id={`button-${i}`}
        type="button"
        props={{ button: { text: `按钮${i}` } }}
        styles={{}}
        events={{}}
      />
    ))

    render(<div>{buttons}</div>)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // 1000个按钮应在100ms内渲染完成
    expect(renderTime).toBeLessThan(100)

    // 验证所有按钮都已渲染
    expect(screen.getAllByRole('button')).toHaveLength(1000)
  })

  test('复杂组件性能测试', () => {
    const complexProps = {
      button: {
        text: '复杂按钮',
        variant: 'primary' as const,
        size: 'md' as const,
        loading: true,
        icon: '🚀',
        icon_position: 'left' as const,
        onClick: 'console.log("clicked")'
      }
    }

    const complexStyles = {
      width: '200px',
      height: '60px',
      backgroundColor: '#ff0000',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      transform: 'translateY(2px)',
    }

    const startTime = performance.now()

    render(
      <PageButton
        id="complex-button"
        type="button"
        props={complexProps}
        styles={complexStyles}
        events={{}}
      />
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // 复杂组件应在10ms内渲染完成
    expect(renderTime).toBeLessThan(10)
  })
})
```

### 5.2 内存泄漏测试

```typescript
// tests/performance/memory-leak.test.ts
import { describe, test, expect, jest } from '@jest/globals'
import { render, unmount, cleanup } from '@testing-library/react'
import { PageButton } from '@/components/lowcode/page-basic/PageButton'

describe('内存泄漏测试', () => {
  test('组件卸载应清理所有事件监听器', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

    // 渲染组件
    const { unmount } = render(<PageButton {...mockProps} />)

    const addedListeners = addEventListenerSpy.mock.calls.length
    addEventListenerSpy.mockClear()

    // 卸载组件
    unmount()

    const removedListeners = removeEventListenerSpy.mock.calls.length

    // 验证所有事件监听器都已移除
    expect(removedListeners).toBeGreaterThanOrEqual(addedListeners)

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  test('大量组件创建和销毁不应导致内存泄漏', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

    // 创建和销毁大量组件
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(
        <PageButton
          id={`button-${i}`}
          type="button"
          props={{ button: { text: `按钮${i}` } }}
          styles={{}}
          events={{}}
        />
      )
      unmount()
    }

    // 强制垃圾回收
    if (global.gc) {
      global.gc()
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryGrowth = finalMemory - initialMemory

    // 内存增长应小于10MB
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024)
  })
})
```

## 6. 可访问性测试策略

### 6.1 自动化可访问性测试

```typescript
// tests/accessibility/automated.test.tsx
import { describe, test, expect, jest } from '@jest/globals'
import { render, screen, axe } from '@testing-library/react'
import { PageButton } from '@/components/lowcode/page-basic/PageButton'

describe('自动化可访问性测试', () => {
  test('Button组件应通过axe验证', async () => {
    const { container } = render(<PageButton {...mockProps} />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('所有基础组件应通过可访问性验证', async () => {
    const components = [
      { name: 'Button', component: <PageButton {...mockProps} /> },
      // 添加其他组件
    ]

    for (const { name, component } of components) {
      const { container } = render(component)
      const results = await axe(container)

      expect(results).toHaveNoViolations()
    }
  })
})
```

### 6.2 手动可访问性测试清单

```typescript
// tests/accessibility/manual-checklist.test.ts
describe('手动可访问性测试清单', () => {
  test('键盘导航清单', () => {
    // [ ] 所有交互元素都可以通过Tab键访问
    // [ ] Tab顺序符合逻辑和视觉顺序
    // [ ] 焦点指示器清晰可见
    // [ ] 支持Shift+Tab反向导航
    // [ ] Enter和空格键可以激活按钮
    // [ ] Escape键可以关闭模态框
    // [ ] 方向键可以导航菜单和列表
  })

  test('屏幕阅读器支持清单', () => {
    // [ ] 所有图像都有alt文本
    // [ ] 表单元素有关联的label
    // [ ] 交互元素有适当的role属性
    // [ ] 状态变化会通过aria-live区域通知
    // [ ] 页面标题正确描述页面内容
    // [ ] 标题层级结构正确
  })

  test('颜色和对比度清单', () => {
    // [ ] 文本和背景对比度至少4.5:1
    // [ ] 大文本对比度至少3:1
    // [ ] 交互元素有非颜色的视觉指示
    // [ ] 支持高对比度模式
    // [ ] 色盲用户可以区分所有元素
  })

  test('响应式和缩放清单', () => {
    // [ ] 放大到200%时内容仍然可用
    // [ ] 横向滚动不会隐藏内容
    // [ ] 触摸目标至少44x44像素
    // [ ] 文本不会因缩放而重叠
    // [ ] 在移动设备上易于操作
  })
})
```

## 7. 测试工具配置建议

### 7.1 Jest配置优化

```typescript
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/setup/test-setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'stores/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/__tests__/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  testTimeout: 10000,
  maxConcurrency: 5,
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // 特定文件的覆盖率要求
    'components/lowcode/**/*.{js,jsx,ts,tsx}': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  // 性能相关配置
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
}

export default createJestConfig(config)
```

### 7.2 测试工具扩展配置

```typescript
// tests/setup/test-setup.ts
import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// 配置Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
})

// 全局测试工具
global.createMockEvent = (type: string, data: any = {}) => {
  const event = new Event(type, { bubbles: true })
  Object.assign(event, data)
  return event
}

global.waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟Intersection Observer
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
```

### 7.3 CI/CD集成配置

```yaml
# .github/workflows/test.yml
name: 测试流水线

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: 使用 Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: 安装依赖
        run: pnpm install --frozen-lockfile

      - name: 运行 ESLint
        run: pnpm lint

      - name: 运行类型检查
        run: pnpm type-check

      - name: 运行单元测试
        run: pnpm test:coverage

      - name: 上传覆盖率报告
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: 构建项目
        run: pnpm build

  e2e-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: 使用 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'pnpm'

      - name: 安装依赖
        run: pnpm install --frozen-lockfile

      - name: 安装 Playwright
        run: pnpm exec playwright install --with-deps

      - name: 构建应用
        run: pnpm build

      - name: 运行 E2E 测试
        run: pnpm test:e2e

      - name: 上传测试报告
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  performance-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: 使用 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'pnpm'

      - name: 安装依赖
        run: pnpm install --frozen-lockfile

      - name: 构建应用
        run: pnpm build

      - name: 运行性能测试
        run: pnpm test:performance

      - name: 运行 Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### 7.4 包.json脚本更新

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:unit": "jest tests/components",
    "test:integration": "jest tests/integration",
    "test:performance": "jest tests/performance",
    "test:accessibility": "jest tests/accessibility",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "pnpm lint && pnpm type-check && pnpm test:coverage && pnpm test:e2e"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/jest": "^29.5.0",
    "axe-playwright": "^2.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "lighthouse": "^11.0.0",
    "playwright": "^1.40.0"
  }
}
```

## 8. 测试用例设计建议

### 8.1 测试用例模板

```typescript
// tests/templates/component-test-template.tsx
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from '@/components/path/to/ComponentName'

describe('ComponentName', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  describe('渲染测试', () => {
    test('应该正确渲染默认状态', () => {
      // 测试代码
    })

    test('应该正确处理必需属性', () => {
      // 测试代码
    })

    test('应该正确应用可选属性', () => {
      // 测试代码
    })
  })

  describe('交互测试', () => {
    test('应该正确处理点击事件', async () => {
      // 测试代码
    })

    test('应该正确处理键盘事件', async () => {
      // 测试代码
    })
  })

  describe('状态测试', () => {
    test('应该正确处理加载状态', () => {
      // 测试代码
    })

    test('应该正确处理错误状态', () => {
      // 测试代码
    })
  })

  describe('可访问性测试', () => {
    test('应该有正确的ARIA属性', () => {
      // 测试代码
    })

    test('应该支持键盘导航', async () => {
      // 测试代码
    })
  })
})
```

### 8.2 测试数据工厂

```typescript
// tests/factories/component-factory.ts
import { ComponentInstance, ComponentRendererProps } from '@/types/page-designer/component'

export class ComponentFactory {
  static createButton(overrides: Partial<ComponentRendererProps> = {}): ComponentRendererProps {
    return {
      id: 'button-1',
      type: 'button',
      props: {
        button: {
          text: '测试按钮',
          variant: 'primary',
          size: 'md',
          disabled: false,
        },
      },
      styles: {},
      events: {},
      ...overrides,
    }
  }

  static createInput(overrides: Partial<ComponentRendererProps> = {}): ComponentRendererProps {
    return {
      id: 'input-1',
      type: 'input',
      props: {
        input: {
          type: 'text',
          placeholder: '请输入内容',
          required: false,
          disabled: false,
        },
      },
      styles: {},
      events: {},
      ...overrides,
    }
  }

  static createContainer(overrides: Partial<ComponentRendererProps> = {}): ComponentRendererProps {
    return {
      id: 'container-1',
      type: 'container',
      props: {
        container: {
          direction: 'column',
          gap: 16,
          padding: 16,
        },
      },
      styles: {},
      events: {},
      ...overrides,
    }
  }
}
```

## 9. 总结

本测试策略提供了全面的低代码平台组件库测试方案，包括：

1. **单元测试**: 覆盖组件的基本功能、属性配置和事件处理
2. **集成测试**: 验证组件间交互、拖拽操作和状态管理
3. **E2E测试**: 确保完整的用户工作流程正常运行
4. **性能测试**: 保证组件渲染和交互性能达标
5. **可访问性测试**: 确保符合WCAG 2.1 AA标准

通过这套完整的测试策略，可以确保低代码平台组件库的质量、性能和可访问性，为用户提供稳定可靠的使用体验。

### 关键成功因素

1. **高测试覆盖率**: 单元测试覆盖率应达到80%以上
2. **快速反馈**: 单元测试应在秒级完成
3. **真实场景**: E2E测试覆盖实际用户使用场景
4. **持续集成**: 所有测试都应集成到CI/CD流水线
5. **定期审查**: 定期审查和更新测试用例

### 下一步行动

1. 根据本文档配置测试环境
2. 实施基础组件的单元测试
3. 逐步添加集成测试和E2E测试
4. 建立性能监控和可访问性检查流程
5. 培训开发团队测试最佳实践
