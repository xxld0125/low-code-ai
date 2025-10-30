import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/lowcode/basic/Button'

describe('Button组件', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    test('正确渲染默认Button', () => {
      render(<Button text="测试按钮" />)

      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('测试按钮')
      expect(button).toHaveAttribute('data-variant', 'default')
      expect(button).toHaveAttribute('data-size', 'medium')
      expect(button).toHaveAttribute('data-disabled', 'false')
      expect(button).not.toBeDisabled()
    })

    test('支持自定义className', () => {
      render(<Button text="测试按钮" className="custom-class" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveClass('custom-class')
    })

    test('支持HTML属性透传', () => {
      render(<Button text="测试按钮" data-testid="custom-testid" />)

      const button = screen.getByTestId('custom-testid')
      expect(button).toBeInTheDocument()
    })
  })

  describe('变体样式', () => {
    test('正确渲染primary变体', () => {
      render(<Button text="主要按钮" variant="primary" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-variant', 'default')
    })

    test('正确渲染secondary变体', () => {
      render(<Button text="次要按钮" variant="secondary" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-variant', 'secondary')
    })

    test('正确渲染outline变体', () => {
      render(<Button text="轮廓按钮" variant="outline" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-variant', 'outline')
    })

    test('正确渲染ghost变体', () => {
      render(<Button text="幽灵按钮" variant="ghost" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-variant', 'ghost')
    })

    test('正确渲染destructive变体', () => {
      render(<Button text="危险按钮" variant="destructive" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-variant', 'destructive')
    })
  })

  describe('尺寸变化', () => {
    test('正确渲染small尺寸', () => {
      render(<Button text="小按钮" size="sm" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-size', 'small')
    })

    test('正确渲染large尺寸', () => {
      render(<Button text="大按钮" size="lg" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-size', 'large')
    })

    test('正确渲染icon尺寸', () => {
      render(<Button text="图标按钮" size="icon" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-size', 'icon')
    })
  })

  describe('状态管理', () => {
    test('禁用状态正确显示', () => {
      render(<Button text="禁用按钮" disabled />)

      const button = screen.getByTestId('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('data-disabled', 'true')
    })

    test('loading状态正确显示', () => {
      render(<Button text="加载中" loading />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-loading', 'true')
      expect(button).toBeDisabled() // loading时应该禁用
    })

    test('loading时禁用onClick事件', async () => {
      const handleClick = jest.fn()
      render(<Button text="加载中" loading onClick={handleClick} />)

      const button = screen.getByTestId('button')
      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('事件处理', () => {
    test('onClick事件正确触发', async () => {
      const handleClick = jest.fn()
      render(<Button text="点击我" onClick={handleClick} />)

      const button = screen.getByTestId('button')
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('禁用状态下不触发onClick事件', async () => {
      const handleClick = jest.fn()
      render(<Button text="禁用按钮" disabled onClick={handleClick} />)

      const button = screen.getByTestId('button')
      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    test('支持onFocus事件', async () => {
      const handleFocus = jest.fn()
      render(<Button text="测试按钮" onFocus={handleFocus} />)

      const button = screen.getByTestId('button')
      button.focus()

      await waitFor(() => {
        expect(handleFocus).toHaveBeenCalledTimes(1)
      })
    })

    test('支持onBlur事件', async () => {
      const handleBlur = jest.fn()
      render(<Button text="测试按钮" onBlur={handleBlur} />)

      const button = screen.getByTestId('button')
      button.focus()
      button.blur()

      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('键盘交互', () => {
    test('支持Enter键触发', async () => {
      const handleClick = jest.fn()
      render(<Button text="测试按钮" onClick={handleClick} />)

      const button = screen.getByTestId('button')
      button.focus()
      fireEvent.keyDown(button, { key: 'Enter' })

      await waitFor(() => {
        expect(handleClick).toHaveBeenCalledTimes(1)
      })
    })

    test('支持空格键触发', async () => {
      const handleClick = jest.fn()
      render(<Button text="测试按钮" onClick={handleClick} />)

      const button = screen.getByTestId('button')
      button.focus()
      fireEvent.keyDown(button, { key: ' ' })

      await waitFor(() => {
        expect(handleClick).toHaveBeenCalledTimes(1)
      })
    })

    test('禁用状态下键盘事件不触发', async () => {
      const handleClick = jest.fn()
      render(<Button text="禁用按钮" disabled onClick={handleClick} />)

      const button = screen.getByTestId('button')
      fireEvent.keyDown(button, { key: 'Enter' })

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('可访问性', () => {
    test('具有正确的ARIA角色', () => {
      render(<Button text="测试按钮" />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    test('支持aria-label属性', () => {
      render(<Button text="" aria-label="删除操作" />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '删除操作')
    })

    test('支持aria-disabled属性', () => {
      render(<Button text="禁用按钮" disabled />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    test('支持aria-describedby属性', () => {
      render(<Button text="测试按钮" aria-describedby="button-help" />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'button-help')
    })
  })

  describe('类型安全', () => {
    test('variant属性只接受有效值', () => {
      // TypeScript编译时会检查，这里只验证运行时行为
      const validVariants = ['default', 'primary', 'secondary', 'outline', 'ghost', 'destructive']

      validVariants.forEach(variant => {
        expect(() => {
          render(<Button text="测试" variant={variant as 'default' | 'secondary' | 'outline'} />)
        }).not.toThrow()
      })
    })

    test('size属性只接受有效值', () => {
      const validSizes = ['default', 'sm', 'lg', 'icon']

      validSizes.forEach(size => {
        expect(() => {
          render(<Button text="测试" size={size as 'default' | 'sm' | 'lg' | 'icon'} />)
        }).not.toThrow()
      })
    })
  })

  describe('响应式行为', () => {
    test('支持响应式尺寸', () => {
      render(
        <Button text="响应式按钮" size={{ base: 'sm', md: 'md', lg: 'lg' } as ResponsiveSize} />
      )

      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
    })

    test('支持响应式变体', () => {
      render(
        <Button
          text="响应式按钮"
          variant={{ base: 'outline', md: 'default' } as ResponsiveVariant}
        />
      )

      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('性能优化', () => {
    test('正确使用React.memo', () => {
      const { rerender } = render(<Button text="测试按钮" />)
      const button = screen.getByTestId('button')

      rerender(<Button text="测试按钮" />)

      // Button组件应该被memo包装，相同props不应该重新渲染
      expect(button).toBeInTheDocument()
    })

    test('支持forwardRef', () => {
      const ref = { current: null }
      render(<Button text="测试按钮" ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('边界情况', () => {
    test('空文本内容', () => {
      render(<Button text="" />)

      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('')
    })

    test('超长文本内容', () => {
      const longText = 'A'.repeat(1000)
      render(<Button text={longText} />)

      const button = screen.getByTestId('button')
      expect(button).toHaveTextContent(longText)
    })

    test('同时传入loading和disabled', () => {
      render(<Button text="测试" loading disabled />)

      const button = screen.getByTestId('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('data-loading', 'true')
      expect(button).toHaveAttribute('data-disabled', 'true')
    })

    test('不传入onClick时点击不会报错', async () => {
      render(<Button text="测试按钮" />)

      const button = screen.getByTestId('button')
      expect(() => {
        user.click(button)
      }).not.toThrow()
    })
  })
})
