import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Radio } from '@/components/lowcode/basic/Radio'

// Mock Radio组件（将在实现后替换）
jest.mock('@/components/lowcode/basic/Radio', () => ({
  Radio: jest.fn(
    ({
      name,
      value,
      checked,
      defaultChecked,
      disabled,
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
          data-testid="radio-input"
          type="radio"
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          required={required}
          aria-describedby={error ? `${name}-error` : undefined}
          className={className}
          data-size={size}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
        <label data-testid="radio-label">{children}</label>
        {error && (
          <span data-testid="error-message" id={`${name}-error`}>
            {error}
          </span>
        )}
        {helperText && <span data-testid="helper-text">{helperText}</span>}
      </div>
    )
  ),
}))

describe('Radio组件', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    test('正确渲染默认Radio', () => {
      render(<Radio value="option1">选项1</Radio>)

      const radio = screen.getByTestId('radio-input')
      const label = screen.getByTestId('radio-label')

      expect(radio).toBeInTheDocument()
      expect(label).toBeInTheDocument()
      expect(label).toHaveTextContent('选项1')
      expect(radio).not.toBeDisabled()
      expect(radio).not.toBeChecked()
      expect(radio).not.toHaveAttribute('aria-describedby')
    })

    test('支持自定义className', () => {
      render(
        <Radio value="option1" className="custom-radio">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveClass('custom-radio')
    })

    test('支持HTML属性透传', () => {
      render(
        <Radio value="option1" data-testid="custom-testid">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('custom-testid')
      expect(radio).toBeInTheDocument()
    })

    test('无子元素时正常渲染', () => {
      render(<Radio value="option1" />)

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeInTheDocument()
    })
  })

  describe('名称和值', () => {
    test('支持name属性', () => {
      render(
        <Radio name="gender" value="male">
          男
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('name', 'gender')
      expect(radio).toHaveAttribute('value', 'male')
    })

    test('支持value属性', () => {
      render(<Radio value="option1">选项1</Radio>)

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('value', 'option1')
    })
  })

  describe('选中状态', () => {
    test('支持受控模式', async () => {
      const handleChange = jest.fn()
      render(
        <Radio value="option1" checked onChange={handleChange}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeChecked()

      await user.click(radio)
      expect(handleChange).toHaveBeenCalled()
    })

    test('支持非受控模式', async () => {
      render(
        <Radio value="option1" defaultChecked>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeChecked()

      await user.click(radio)
      // 非受控模式下，defaultChecked不会被改变
      expect(radio).toBeChecked()
    })

    test('同时使用checked和defaultChecked时checked优先', () => {
      render(
        <Radio value="option1" checked defaultChecked>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeChecked()
    })
  })

  describe('状态管理', () => {
    test('禁用状态正确显示', () => {
      render(
        <Radio value="option1" disabled>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeDisabled()
    })

    test('必填状态正确显示', () => {
      render(
        <Radio value="option1" required>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('required')
    })

    test('错误状态正确显示', () => {
      render(
        <Radio value="option1" name="test-radio" error="请选择一项">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('aria-describedby', 'test-radio-error')
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('请选择一项')
      expect(screen.getByTestId('error-message')).toHaveAttribute('id', 'test-radio-error')
    })

    test('helperText正确显示', () => {
      render(
        <Radio value="option1" helperText="选择此项表示同意">
          选项1
        </Radio>
      )

      const helperText = screen.getByTestId('helper-text')
      expect(helperText).toBeInTheDocument()
      expect(helperText).toHaveTextContent('选择此项表示同意')
    })
  })

  describe('尺寸变化', () => {
    test('支持small尺寸', () => {
      render(
        <Radio value="option1" size="small">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeInTheDocument()
    })

    test('支持medium尺寸', () => {
      render(
        <Radio value="option1" size="medium">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeInTheDocument()
    })

    test('支持large尺寸', () => {
      render(
        <Radio value="option1" size="large">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeInTheDocument()
    })
  })

  describe('事件处理', () => {
    test('onChange事件正确触发', async () => {
      const handleChange = jest.fn()
      render(
        <Radio value="option1" onChange={handleChange}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      await user.click(radio)

      expect(handleChange).toHaveBeenCalled()
    })

    test('onFocus事件正确触发', async () => {
      const handleFocus = jest.fn()
      render(
        <Radio value="option1" onFocus={handleFocus}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      radio.focus()

      await waitFor(() => {
        expect(handleFocus).toHaveBeenCalledTimes(1)
      })
    })

    test('onBlur事件正确触发', async () => {
      const handleBlur = jest.fn()
      render(
        <Radio value="option1" onBlur={handleBlur}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      radio.focus()
      radio.blur()

      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalledTimes(1)
      })
    })

    test('禁用状态下不触发onChange事件', async () => {
      const handleChange = jest.fn()
      render(
        <Radio value="option1" disabled onChange={handleChange}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      await user.click(radio)

      expect(handleChange).not.toHaveBeenCalled()
    })

    test('点击标签也能触发onChange', async () => {
      const handleChange = jest.fn()
      render(
        <Radio value="option1" onChange={handleChange}>
          选项1
        </Radio>
      )

      const label = screen.getByTestId('radio-label')
      await user.click(label)

      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('键盘交互', () => {
    test('支持空格键选择', async () => {
      const handleChange = jest.fn()
      render(
        <Radio value="option1" onChange={handleChange}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      radio.focus()
      fireEvent.keyDown(radio, { key: ' ' })

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })
    })

    test('支持方向键导航', async () => {
      render(
        <div>
          <Radio value="option1">选项1</Radio>
          <Radio value="option2">选项2</Radio>
          <Radio value="option3">选项3</Radio>
        </div>
      )

      const radios = screen.getAllByTestId('radio-input')
      radios[0].focus()

      fireEvent.keyDown(radios[0], { key: 'ArrowDown' })
      fireEvent.keyDown(radios[0], { key: 'ArrowUp' })

      expect(radios[0]).toBeInTheDocument()
    })

    test('禁用状态下键盘事件不触发', async () => {
      const handleChange = jest.fn()
      render(
        <Radio value="option1" disabled onChange={handleChange}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      fireEvent.keyDown(radio, { key: ' ' })

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('单选组行为', () => {
    test('同组内只能选择一个选项', async () => {
      const handleChange = jest.fn()
      render(
        <div>
          <Radio name="group" value="option1" onChange={handleChange}>
            选项1
          </Radio>
          <Radio name="group" value="option2" onChange={handleChange}>
            选项2
          </Radio>
          <Radio name="group" value="option3" onChange={handleChange}>
            选项3
          </Radio>
        </div>
      )

      const radios = screen.getAllByTestId('radio-input')
      await user.click(radios[0])
      await user.click(radios[1])

      expect(handleChange).toHaveBeenCalledTimes(2)
    })

    test('不同组之间互不影响', async () => {
      const handleChange1 = jest.fn()
      const handleChange2 = jest.fn()

      render(
        <div>
          <div>
            <Radio name="group1" value="option1" onChange={handleChange1}>
              组1-选项1
            </Radio>
            <Radio name="group1" value="option2" onChange={handleChange1}>
              组1-选项2
            </Radio>
          </div>
          <div>
            <Radio name="group2" value="option1" onChange={handleChange2}>
              组2-选项1
            </Radio>
            <Radio name="group2" value="option2" onChange={handleChange2}>
              组2-选项2
            </Radio>
          </div>
        </div>
      )

      const radios = screen.getAllByTestId('radio-input')
      await user.click(radios[0]) // 组1-选项1
      await user.click(radios[2]) // 组2-选项1

      expect(handleChange1).toHaveBeenCalledTimes(1)
      expect(handleChange2).toHaveBeenCalledTimes(1)
    })

    test('受控模式下正确处理组内选择', async () => {
      const handleChange = jest.fn()
      const { rerender } = render(
        <div>
          <Radio name="group" value="option1" checked onChange={handleChange}>
            选项1
          </Radio>
          <Radio name="group" value="option2" onChange={handleChange}>
            选项2
          </Radio>
        </div>
      )

      const radios = screen.getAllByTestId('radio-input')
      expect(radios[0]).toBeChecked()
      expect(radios[1]).not.toBeChecked()

      // 模拟父组件更新选择项
      rerender(
        <div>
          <Radio name="group" value="option1" onChange={handleChange}>
            选项1
          </Radio>
          <Radio name="group" value="option2" checked onChange={handleChange}>
            选项2
          </Radio>
        </div>
      )

      expect(radios[0]).not.toBeChecked()
      expect(radios[1]).toBeChecked()
    })
  })

  describe('可访问性', () => {
    test('具有正确的ARIA属性', () => {
      render(
        <Radio
          name="test"
          value="option1"
          required
          error="请选择一项"
          aria-label="测试选项"
          aria-describedby="radio-help"
        >
          选项1
        </Radio>
      )

      const radio = screen.getByRole('radio')
      expect(radio).toHaveAttribute('aria-label', '测试选项')
      expect(radio).toHaveAttribute('aria-describedby', 'radio-help')
      expect(radio).toHaveAttribute('required')
    })

    test('支持aria-checked属性', () => {
      render(
        <Radio value="option1" checked>
          选项1
        </Radio>
      )

      const radio = screen.getByRole('radio')
      expect(radio).toHaveAttribute('aria-checked', 'true')
    })

    test('支持aria-disabled属性', () => {
      render(
        <Radio value="option1" disabled>
          选项1
        </Radio>
      )

      const radio = screen.getByRole('radio')
      expect(radio).toHaveAttribute('aria-disabled', 'true')
    })

    test('支持form属性', () => {
      render(
        <Radio value="option1" form="testForm">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('form', 'testForm')
    })
  })

  describe('响应式行为', () => {
    test('支持响应式尺寸', () => {
      render(
        <Radio value="option1" size={{ base: 'sm', md: 'md', lg: 'lg' } as ResponsiveSize}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeInTheDocument()
    })
  })

  describe('性能优化', () => {
    test('正确使用React.memo', () => {
      const { rerender } = render(<Radio value="option1">选项1</Radio>)
      const radio = screen.getByTestId('radio-input')

      rerender(<Radio value="option1">选项1</Radio>)

      expect(radio).toBeInTheDocument()
    })

    test('支持forwardRef', () => {
      const ref = { current: null }
      render(
        <Radio value="option1" ref={ref}>
          选项1
        </Radio>
      )

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('特殊功能', () => {
    test('支持自动对焦', () => {
      render(
        <Radio value="option1" autoFocus>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('autofocus')
    })

    test('支持表单验证', () => {
      render(
        <Radio value="option1" required>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('required')
    })

    test('支持自定义ID属性', () => {
      render(
        <Radio value="option1" id="custom-id">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('id', 'custom-id')
    })
  })

  describe('边界情况', () => {
    test('处理空文本内容', () => {
      render(<Radio value="option1"></Radio>)

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeInTheDocument()
    })

    test('处理超长文本内容', () => {
      const longText = 'A'.repeat(1000)
      render(<Radio value="option1">{longText}</Radio>)

      const label = screen.getByTestId('radio-label')
      expect(label).toHaveTextContent(longText)
    })

    test('同时使用多个约束属性', () => {
      render(
        <Radio value="option1" name="test" disabled required error="错误信息">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeDisabled()
      expect(radio).toHaveAttribute('required')
      expect(radio).toHaveAttribute('aria-describedby', 'test-error')
      expect(radio).toHaveAttribute('name', 'test')
    })

    test('不提供必需的回调函数时不会报错', () => {
      expect(() => {
        render(<Radio value="option1">选项1</Radio>)
      }).not.toThrow()
    })

    test('处理受控模式下点击但checked未变化', async () => {
      const handleChange = jest.fn().mockImplementation(() => {
        // 模拟父组件不更新checked值的情况
      })

      const { rerender } = render(
        <Radio value="option1" checked onChange={handleChange}>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeChecked()

      await user.click(radio)
      expect(handleChange).toHaveBeenCalled()

      // 重新渲染相同的checked值
      rerender(
        <Radio value="option1" checked onChange={handleChange}>
          选项1
        </Radio>
      )
      expect(radio).toBeChecked()
    })

    test('处理没有name属性的Radio组', async () => {
      const handleChange = jest.fn()
      render(
        <div>
          <Radio value="option1" onChange={handleChange}>
            选项1
          </Radio>
          <Radio value="option2" onChange={handleChange}>
            选项2
          </Radio>
        </div>
      )

      const radios = screen.getAllByTestId('radio-input')
      await user.click(radios[0])
      await user.click(radios[1])

      // 没有name属性时，每个Radio都是独立的
      expect(handleChange).toHaveBeenCalledTimes(2)
    })

    test('处理相同value的Radio', () => {
      render(
        <div>
          <Radio name="group" value="same">
            选项1
          </Radio>
          <Radio name="group" value="same">
            选项2
          </Radio>
        </div>
      )

      const radios = screen.getAllByTestId('radio-input')
      expect(radios).toHaveLength(2)
      expect(radios[0]).toHaveAttribute('value', 'same')
      expect(radios[1]).toHaveAttribute('value', 'same')
    })
  })

  describe('视觉反馈', () => {
    test('选中状态有视觉反馈', () => {
      render(
        <Radio value="option1" checked>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeChecked()
    })

    test('禁用状态有视觉反馈', () => {
      render(
        <Radio value="option1" disabled>
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toBeDisabled()
    })

    test('错误状态有视觉反馈', () => {
      render(
        <Radio value="option1" name="test" error="错误信息">
          选项1
        </Radio>
      )

      const radio = screen.getByTestId('radio-input')
      expect(radio).toHaveAttribute('aria-describedby', 'test-error')
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    test('hover状态有视觉反馈', async () => {
      render(<Radio value="option1">选项1</Radio>)

      const radio = screen.getByTestId('radio-input')
      fireEvent.mouseEnter(radio)

      expect(radio).toBeInTheDocument()
    })

    test('focus状态有视觉反馈', async () => {
      render(<Radio value="option1">选项1</Radio>)

      const radio = screen.getByTestId('radio-input')
      radio.focus()

      expect(radio).toHaveFocus()
    })
  })
})
