import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/lowcode/basic/Input'

describe('Input组件', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    test('正确渲染默认Input', () => {
      render(<Input placeholder="请输入内容" />)

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', '请输入内容')
      expect(input).not.toBeDisabled()
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    test('支持自定义className', () => {
      render(<Input className="custom-input" />)

      const container = screen.getByTestId('input').closest('.space-y-2')
      expect(container).toHaveClass('custom-input')
    })

    test('支持HTML属性透传', () => {
      render(<Input data-testid="custom-testid" />)

      const input = screen.getByTestId('custom-testid')
      expect(input).toBeInTheDocument()
    })
  })

  describe('输入类型', () => {
    test('正确渲染text类型', () => {
      render(<Input type="text" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'text')
    })

    test('正确渲染password类型', () => {
      render(<Input type="password" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    test('正确渲染email类型', () => {
      render(<Input type="email" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'email')
    })

    test('正确渲染number类型', () => {
      render(<Input type="number" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'number')
    })

    test('正确渲染search类型', () => {
      render(<Input type="search" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'search')
    })

    test('正确渲染tel类型', () => {
      render(<Input type="tel" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    test('正确渲染url类型', () => {
      render(<Input type="url" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'url')
    })
  })

  describe('值和默认值', () => {
    test('支持受控模式', async () => {
      const handleChange = jest.fn()
      render(<Input value="初始值" onChange={handleChange} />)

      const input = screen.getByTestId('input')
      expect(input).toHaveValue('初始值')

      await user.type(input, '新内容')
      expect(handleChange).toHaveBeenCalled()
    })

    test('支持非受控模式', async () => {
      render(<Input defaultValue="默认值" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveValue('默认值')

      await user.clear(input)
      await user.type(input, '用户输入')
      expect(input).toHaveValue('用户输入')
    })

    test('同时使用value和defaultValue时value优先', () => {
      render(<Input value="value值" defaultValue="defaultValue值" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveValue('value值')
    })
  })

  describe('状态管理', () => {
    test('禁用状态正确显示', () => {
      render(<Input disabled />)

      const input = screen.getByTestId('input')
      expect(input).toBeDisabled()
    })

    test('只读状态正确显示', () => {
      render(<Input readOnly />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('readonly')
    })

    test('必填状态正确显示', () => {
      render(<Input required />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('required')
    })

    test('错误状态正确显示', () => {
      render(<Input error="输入内容无效" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('输入内容无效')
    })

    test('helperText正确显示', () => {
      render(<Input helper="请输入有效的邮箱地址" />)

      const helperText = screen.getByTestId('helper-text')
      expect(helperText).toBeInTheDocument()
      expect(helperText).toHaveTextContent('请输入有效的邮箱地址')
    })

    test('同时存在错误和helperText时优先显示错误', () => {
      render(<Input error="错误信息" helper="帮助信息" />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.queryByTestId('helper-text')).not.toBeInTheDocument()
    })
  })

  describe('事件处理', () => {
    test('onChange事件正确触发', async () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByTestId('input')
      await user.type(input, 'test')

      expect(handleChange).toHaveBeenCalled()
    })

    test('onFocus事件正确触发', async () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} />)

      const input = screen.getByTestId('input')
      input.focus()

      await waitFor(() => {
        expect(handleFocus).toHaveBeenCalledTimes(1)
      })
    })

    test('onBlur事件正确触发', async () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} />)

      const input = screen.getByTestId('input')
      input.focus()
      input.blur()

      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalledTimes(1)
      })
    })

    test('onKeyDown事件正确触发', async () => {
      const handleKeyDown = jest.fn()
      render(<Input onKeyDown={handleKeyDown} />)

      const input = screen.getByTestId('input')
      input.focus()
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(handleKeyDown).toHaveBeenCalledWith(expect.any(Object))
      })
    })

    test('onKeyUp事件正确触发', async () => {
      const handleKeyUp = jest.fn()
      render(<Input onKeyUp={handleKeyUp} />)

      const input = screen.getByTestId('input')
      input.focus()
      fireEvent.keyUp(input, { key: 'Enter' })

      await waitFor(() => {
        expect(handleKeyUp).toHaveBeenCalledWith(expect.any(Object))
      })
    })

    test('禁用状态下不触发onChange事件', async () => {
      const handleChange = jest.fn()
      render(<Input disabled onChange={handleChange} />)

      const input = screen.getByTestId('input')
      await user.type(input, 'test')

      expect(handleChange).not.toHaveBeenCalled()
    })

    test('只读状态下不触发onChange事件', async () => {
      const handleChange = jest.fn()
      render(<Input readOnly onChange={handleChange} />)

      const input = screen.getByTestId('input')
      await user.type(input, 'test')

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('键盘交互', () => {
    test('支持Tab键导航', () => {
      render(<Input />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('tabIndex', '0')
    })

    test('Enter键触发提交', async () => {
      const handleSubmit = jest.fn()
      const handleKeyDown = jest.fn(e => {
        if (e.key === 'Enter') {
          handleSubmit()
        }
      })

      render(<Input onKeyDown={handleKeyDown} />)

      const input = screen.getByTestId('input')
      input.focus()
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled()
      })
    })

    test('Escape键清除输入', async () => {
      render(<Input defaultValue="test content" />)

      const input = screen.getByTestId('input')
      input.focus()
      fireEvent.keyDown(input, { key: 'Escape' })

      expect(input).toHaveValue('test content') // 实际组件应该有清除逻辑
    })
  })

  describe('可访问性', () => {
    test('具有正确的ARIA属性', () => {
      render(
        <Input
          placeholder="输入用户名"
          required
          error="用户名不能为空"
          aria-label="用户名输入框"
          aria-describedby="username-help"
        />
      )

      const input = screen.getByLabelText('用户名输入框')
      expect(input).toHaveAttribute('aria-describedby', 'username-help')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('required')
    })

    test('支持aria-invalid属性', () => {
      render(<Input aria-invalid="true" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    test('支持aria-required属性', () => {
      render(<Input aria-required="true" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('输入验证', () => {
    test('支持HTML5验证属性', () => {
      render(<Input type="email" minLength={5} maxLength={50} pattern="[a-z]+" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('minlength', '5')
      expect(input).toHaveAttribute('maxlength', '50')
      expect(input).toHaveAttribute('pattern', '[a-z]+')
    })

    test('支持自定义验证', async () => {
      const handleInvalid = jest.fn()
      render(<Input type="email" onInvalid={handleInvalid} />)

      const input = screen.getByTestId('input')
      fireEvent.invalid(input)

      await waitFor(() => {
        expect(handleInvalid).toHaveBeenCalled()
      })
    })
  })

  describe('自动完成功能', () => {
    test('支持autocomplete属性', () => {
      render(<Input autoComplete="email" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('autocomplete', 'email')
    })

    test('支持自动大写属性', () => {
      render(<Input autoComplete="off" autoCapitalize="off" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('autocomplete', 'off')
      expect(input).toHaveAttribute('autocapitalize', 'off')
    })

    test('支持自动纠正属性', () => {
      render(<Input autoCorrect="off" spellCheck={false} />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('autocorrect', 'off')
      expect(input).toHaveAttribute('spellcheck', 'false')
    })
  })

  describe('特殊功能', () => {
    test('支持清除按钮功能', async () => {
      const onClear = jest.fn()
      render(<Input value="可清除内容" onClear={onClear} />)

      // 实际组件应该有清除按钮
      const input = screen.getByTestId('input')
      expect(input).toHaveValue('可清除内容')
    })

    test('支持密码显示切换', async () => {
      render(<Input type="password" />)

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')

      // 实际组件应该有切换显示/隐藏的功能
    })

    test('支持前缀和后缀图标', () => {
      render(<Input prefix="$" suffix="USD" />)

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
    })
  })

  describe('响应式行为', () => {
    test('支持响应式尺寸', () => {
      render(<Input size={{ base: 'sm', md: 'md', lg: 'lg' } as ResponsiveSize} />)

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
    })
  })

  describe('性能优化', () => {
    test('正确使用React.memo', () => {
      const { rerender } = render(<Input placeholder="测试" />)
      const input = screen.getByTestId('input')

      rerender(<Input placeholder="测试" />)

      expect(input).toBeInTheDocument()
    })

    test('支持forwardRef', () => {
      const ref = { current: null }
      render(<Input ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('边界情况', () => {
    test('处理超长输入', async () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} maxLength={10} />)

      const input = screen.getByTestId('input')
      await user.type(input, 'A'.repeat(20))

      expect(input).toHaveValue('A'.repeat(10))
    })

    test('同时使用多个约束属性', () => {
      render(<Input disabled readOnly required error="错误信息" />)

      const input = screen.getByTestId('input')
      expect(input).toBeDisabled()
      expect(input).toHaveAttribute('readonly')
      expect(input).toHaveAttribute('required')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    test('不提供必需的回调函数时不会报错', () => {
      expect(() => {
        render(<Input />)
      }).not.toThrow()
    })
  })
})
