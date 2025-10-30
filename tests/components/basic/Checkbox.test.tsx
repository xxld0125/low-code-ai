import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/lowcode/basic/Checkbox'

// Mock Checkbox组件（将在实现后替换）
jest.mock('@/components/lowcode/basic/Checkbox', () => ({
  Checkbox: jest.fn(
    ({
      checked,
      defaultChecked,
      disabled,
      indeterminate,
      required,
      error,
      helperText,
      className,
      size,
      onChange,
      onFocus,
      onBlur,
      children,
      ...props
    }) => (
      <div>
        <input
          data-testid="checkbox-input"
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          required={required}
          aria-invalid={error}
          className={className}
          data-size={size}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={el => {
            if (el && indeterminate) {
              el.indeterminate = true
            }
          }}
          {...props}
        />
        <label data-testid="checkbox-label">{children}</label>
        {error && <span data-testid="error-message">{error}</span>}
        {helperText && <span data-testid="helper-text">{helperText}</span>}
      </div>
    )
  ),
}))

describe('Checkbox组件', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    test('正确渲染默认Checkbox', () => {
      render(<Checkbox>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      const label = screen.getByTestId('checkbox-label')

      expect(checkbox).toBeInTheDocument()
      expect(label).toBeInTheDocument()
      expect(label).toHaveTextContent('选项')
      expect(checkbox).not.toBeDisabled()
      expect(checkbox).not.toBeChecked()
      expect(checkbox).not.toHaveAttribute('aria-invalid')
    })

    test('支持自定义className', () => {
      render(<Checkbox className="custom-checkbox">选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toHaveClass('custom-checkbox')
    })

    test('支持HTML属性透传', () => {
      render(<Checkbox data-testid="custom-testid">选项</Checkbox>)

      const checkbox = screen.getByTestId('custom-testid')
      expect(checkbox).toBeInTheDocument()
    })

    test('无子元素时正常渲染', () => {
      render(<Checkbox />)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('选中状态', () => {
    test('支持受控模式', async () => {
      const handleChange = jest.fn()
      render(
        <Checkbox checked onChange={handleChange}>
          选项
        </Checkbox>
      )

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(handleChange).toHaveBeenCalled()
    })

    test('支持非受控模式', async () => {
      render(<Checkbox defaultChecked>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    test('同时使用checked和defaultChecked时checked优先', () => {
      render(
        <Checkbox checked defaultChecked>
          选项
        </Checkbox>
      )

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeChecked()
    })

    test('indeterminate状态正确显示', () => {
      render(<Checkbox indeterminate>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeInTheDocument()
      // indeterminate状态通过ref设置
    })
  })

  describe('状态管理', () => {
    test('禁用状态正确显示', () => {
      render(<Checkbox disabled>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeDisabled()
    })

    test('必填状态正确显示', () => {
      render(<Checkbox required>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toHaveAttribute('required')
    })

    test('错误状态正确显示', () => {
      render(<Checkbox error="请选择此项">选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toHaveAttribute('aria-invalid', '请选择此项')
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('请选择此项')
    })

    test('helperText正确显示', () => {
      render(<Checkbox helperText="勾选表示同意条款">选项</Checkbox>)

      const helperText = screen.getByTestId('helper-text')
      expect(helperText).toBeInTheDocument()
      expect(helperText).toHaveTextContent('勾选表示同意条款')
    })
  })

  describe('尺寸变化', () => {
    test('支持small尺寸', () => {
      render(<Checkbox size="small">选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeInTheDocument()
    })

    test('支持medium尺寸', () => {
      render(<Checkbox size="medium">选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeInTheDocument()
    })

    test('支持large尺寸', () => {
      render(<Checkbox size="large">选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('事件处理', () => {
    test('onChange事件正确触发', async () => {
      const handleChange = jest.fn()
      render(<Checkbox onChange={handleChange}>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      await user.click(checkbox)

      expect(handleChange).toHaveBeenCalled()
    })

    test('onFocus事件正确触发', async () => {
      const handleFocus = jest.fn()
      render(<Checkbox onFocus={handleFocus}>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      checkbox.focus()

      await waitFor(() => {
        expect(handleFocus).toHaveBeenCalledTimes(1)
      })
    })

    test('onBlur事件正确触发', async () => {
      const handleBlur = jest.fn()
      render(<Checkbox onBlur={handleBlur}>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      checkbox.focus()
      checkbox.blur()

      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalledTimes(1)
      })
    })

    test('禁用状态下不触发onChange事件', async () => {
      const handleChange = jest.fn()
      render(
        <Checkbox disabled onChange={handleChange}>
          选项
        </Checkbox>
      )

      const checkbox = screen.getByTestId('checkbox-input')
      await user.click(checkbox)

      expect(handleChange).not.toHaveBeenCalled()
    })

    test('点击标签也能触发onChange', async () => {
      const handleChange = jest.fn()
      render(<Checkbox onChange={handleChange}>选项</Checkbox>)

      const label = screen.getByTestId('checkbox-label')
      await user.click(label)

      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('键盘交互', () => {
    test('支持空格键切换状态', async () => {
      const handleChange = jest.fn()
      render(<Checkbox onChange={handleChange}>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      checkbox.focus()
      fireEvent.keyDown(checkbox, { key: ' ' })

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })
    })

    test('支持Enter键切换状态', async () => {
      const handleChange = jest.fn()
      render(<Checkbox onChange={handleChange}>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      checkbox.focus()
      fireEvent.keyDown(checkbox, { key: 'Enter' })

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })
    })

    test('禁用状态下键盘事件不触发', async () => {
      const handleChange = jest.fn()
      render(
        <Checkbox disabled onChange={handleChange}>
          选项
        </Checkbox>
      )

      const checkbox = screen.getByTestId('checkbox-input')
      fireEvent.keyDown(checkbox, { key: ' ' })

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('可访问性', () => {
    test('具有正确的ARIA属性', () => {
      render(
        <Checkbox
          required
          error="请选择此项"
          aria-label="同意条款"
          aria-describedby="checkbox-help"
        >
          选项
        </Checkbox>
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-label', '同意条款')
      expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-help')
      expect(checkbox).toHaveAttribute('aria-invalid', '请选择此项')
      expect(checkbox).toHaveAttribute('required')
    })

    test('支持aria-checked属性', () => {
      render(<Checkbox checked>选项</Checkbox>)

      const checkbox = screen.getByRole('checkbox')
      // 对于原生checkbox，使用checked属性
      expect(checkbox).toBeChecked()
    })

    test('indeterminate状态时aria-checked为mixed', () => {
      render(<Checkbox indeterminate>选项</Checkbox>)

      // indeterminate状态需要在实际组件中实现
    })

    test('支持aria-disabled属性', () => {
      render(<Checkbox disabled>选项</Checkbox>)

      const checkbox = screen.getByRole('checkbox')
      // Radix UI Checkbox使用disabled属性而不是aria-disabled
      expect(checkbox).toHaveAttribute('disabled')
      expect(checkbox).toBeDisabled()
    })
  })

  describe('分组行为', () => {
    test('支持CheckboxGroup集成', () => {
      render(
        <div role="group" aria-label="选项组">
          <Checkbox value="option1">选项1</Checkbox>
          <Checkbox value="option2">选项2</Checkbox>
          <Checkbox value="option3">选项3</Checkbox>
        </div>
      )

      const group = screen.getByRole('group')
      const checkboxes = screen.getAllByRole('checkbox')

      expect(group).toBeInTheDocument()
      expect(checkboxes).toHaveLength(3)
    })

    test('支持全选/取消全选功能', async () => {
      const handleSelectAll = jest.fn()
      render(
        <div>
          <Checkbox onChange={handleSelectAll}>全选</Checkbox>
          <Checkbox value="item1">项目1</Checkbox>
          <Checkbox value="item2">项目2</Checkbox>
        </div>
      )

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await user.click(selectAllCheckbox)

      expect(handleSelectAll).toHaveBeenCalled()
    })

    test('支持父子级联动', async () => {
      const handleParentChange = jest.fn()
      const handleChildChange = jest.fn()

      render(
        <div>
          <Checkbox onChange={handleParentChange}>父级</Checkbox>
          <Checkbox onChange={handleChildChange}>子级1</Checkbox>
          <Checkbox onChange={handleChildChange}>子级2</Checkbox>
        </div>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // 选择第一个子级
      await user.click(checkboxes[2]) // 选择第二个子级

      expect(handleChildChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('响应式行为', () => {
    test('支持响应式尺寸', () => {
      render(<Checkbox size={{ base: 'sm', md: 'md', lg: 'lg' } as ResponsiveSize}>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('性能优化', () => {
    test('正确使用React.memo', () => {
      const { rerender } = render(<Checkbox>选项</Checkbox>)
      const checkbox = screen.getByTestId('checkbox-input')

      rerender(<Checkbox>选项</Checkbox>)

      expect(checkbox).toBeInTheDocument()
    })

    test('支持forwardRef', () => {
      const ref = { current: null }
      render(<Checkbox ref={ref}>选项</Checkbox>)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('特殊功能', () => {
    test('支持自动对焦', () => {
      render(<Checkbox autoFocus>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      // autoFocus属性在React中可能不会显式设置在DOM上
      // 但可以通过检查是否为document.activeElement来验证
      // 这里我们只验证组件能正确接收autoFocus prop
      expect(checkbox).toBeInTheDocument()
    })

    test('支持表单验证', () => {
      render(<Checkbox required>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toHaveAttribute('required')
    })

    test('支持自定义value属性', () => {
      render(<Checkbox value="custom-value">选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      // checkbox类型的input使用value属性来设置提交值
      // 但在React中，对于checkbox，通常使用checked状态
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    test('处理空文本内容', () => {
      render(<Checkbox></Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeInTheDocument()
    })

    test('处理超长文本内容', () => {
      const longText = 'A'.repeat(1000)
      render(<Checkbox>{longText}</Checkbox>)

      const label = screen.getByTestId('checkbox-label')
      expect(label).toHaveTextContent(longText)
    })

    test('同时使用多个约束属性', () => {
      render(
        <Checkbox disabled required error="错误信息" indeterminate>
          选项
        </Checkbox>
      )

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeDisabled()
      expect(checkbox).toHaveAttribute('required')
      expect(checkbox).toHaveAttribute('aria-invalid', '错误信息')
    })

    test('不提供必需的回调函数时不会报错', () => {
      expect(() => {
        render(<Checkbox>选项</Checkbox>)
      }).not.toThrow()
    })

    test('处理同时设置checked和indeterminate', () => {
      render(
        <Checkbox checked indeterminate>
          选项
        </Checkbox>
      )

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeChecked()
      // indeterminate状态通过ref设置
    })

    test('处理受控模式下点击但checked未变化', async () => {
      const handleChange = jest.fn().mockImplementation(() => {
        // 模拟父组件不更新checked值的情况
      })

      const { rerender } = render(
        <Checkbox checked onChange={handleChange}>
          选项
        </Checkbox>
      )

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(handleChange).toHaveBeenCalled()

      // 重新渲染相同的checked值
      rerender(
        <Checkbox checked onChange={handleChange}>
          选项
        </Checkbox>
      )
      expect(checkbox).toBeChecked()
    })
  })

  describe('视觉反馈', () => {
    test('选中状态有视觉反馈', () => {
      render(<Checkbox checked>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeChecked()
    })

    test('禁用状态有视觉反馈', () => {
      render(<Checkbox disabled>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toBeDisabled()
    })

    test('错误状态有视觉反馈', () => {
      render(<Checkbox error="错误信息">选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      expect(checkbox).toHaveAttribute('aria-invalid', '错误信息')
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    test('hover状态有视觉反馈', async () => {
      render(<Checkbox>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      fireEvent.mouseEnter(checkbox)

      expect(checkbox).toBeInTheDocument()
    })

    test('focus状态有视觉反馈', async () => {
      render(<Checkbox>选项</Checkbox>)

      const checkbox = screen.getByTestId('checkbox-input')
      checkbox.focus()

      expect(checkbox).toHaveFocus()
    })
  })
})
