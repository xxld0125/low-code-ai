import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/lowcode/basic/Textarea'

// Mock Textarea组件（将在实现后替换）
jest.mock('@/components/lowcode/basic/Textarea', () => ({
  Textarea: jest.fn(
    ({
      placeholder,
      value,
      defaultValue,
      disabled,
      required,
      readOnly,
      error,
      helperText,
      className,
      rows,
      cols,
      maxLength,
      minLength,
      resize,
      onChange,
      onFocus,
      onBlur,
      onInput,
      ...props
    }) => (
      <div>
        <textarea
          data-testid="textarea"
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          aria-invalid={error}
          className={className}
          rows={rows}
          cols={cols}
          maxLength={maxLength}
          minLength={minLength}
          style={{ resize: resize || 'vertical' }}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onInput={onInput}
          {...props}
        />
        {error && <span data-testid="error-message">{error}</span>}
        {helperText && <span data-testid="helper-text">{helperText}</span>}
        {maxLength && <span data-testid="char-count">0/{maxLength}</span>}
      </div>
    )
  ),
}))

describe('Textarea组件', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    test('正确渲染默认Textarea', () => {
      render(<Textarea placeholder="请输入多行文本" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('placeholder', '请输入多行文本')
      expect(textarea).not.toBeDisabled()
      expect(textarea).not.toHaveAttribute('aria-invalid')
      expect(textarea).toHaveStyle({ resize: 'vertical' })
    })

    test('支持自定义className', () => {
      render(<Textarea className="custom-textarea" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveClass('custom-textarea')
    })

    test('支持HTML属性透传', () => {
      render(<Textarea data-testid="custom-testid" />)

      const textarea = screen.getByTestId('custom-testid')
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('尺寸控制', () => {
    test('支持rows属性', () => {
      render(<Textarea rows={5} />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    test('支持cols属性', () => {
      render(<Textarea cols={40} />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('cols', '40')
    })

    test('默认行数为4', () => {
      render(<Textarea />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('rows', '4')
    })
  })

  describe('值和默认值', () => {
    test('支持受控模式', async () => {
      const handleChange = jest.fn()
      render(<Textarea value="初始文本" onChange={handleChange} />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveValue('初始文本')

      await user.type(textarea, '新内容')
      expect(handleChange).toHaveBeenCalled()
    })

    test('支持非受控模式', async () => {
      render(<Textarea defaultValue="默认文本" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveValue('默认文本')

      await user.clear(textarea)
      await user.type(textarea, '用户输入的文本')
      expect(textarea).toHaveValue('用户输入的文本')
    })

    test('同时使用value和defaultValue时value优先', () => {
      render(<Textarea value="value值" defaultValue="defaultValue值" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveValue('value值')
    })
  })

  describe('状态管理', () => {
    test('禁用状态正确显示', () => {
      render(<Textarea disabled />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toBeDisabled()
    })

    test('只读状态正确显示', () => {
      render(<Textarea readOnly />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('readonly')
    })

    test('必填状态正确显示', () => {
      render(<Textarea required />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('required')
    })

    test('错误状态正确显示', () => {
      render(<Textarea error="内容不能为空" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('内容不能为空')
    })

    test('helperText正确显示', () => {
      render(<Textarea helperText="请输入详细的描述信息" />)

      const helperText = screen.getByTestId('helper-text')
      expect(helperText).toBeInTheDocument()
      expect(helperText).toHaveTextContent('请输入详细的描述信息')
    })
  })

  describe('长度限制', () => {
    test('支持最大长度限制', async () => {
      render(<Textarea maxLength={100} />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('maxlength', '100')
      expect(screen.getByTestId('char-count')).toBeInTheDocument()
      expect(screen.getByTestId('char-count')).toHaveTextContent('0/100')
    })

    test('支持最小长度限制', () => {
      render(<Textarea minLength={10} />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('minlength', '10')
    })

    test('超出最大长度时自动截断', async () => {
      render(<Textarea maxLength={10} />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'A'.repeat(20))

      expect(textarea).toHaveValue('A'.repeat(10))
    })

    test('字符计数实时更新', async () => {
      render(<Textarea maxLength={50} />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'Hello')

      const charCount = screen.getByTestId('char-count')
      expect(charCount).toHaveTextContent('5/50')
    })
  })

  describe('调整大小功能', () => {
    test('支持垂直调整大小', () => {
      render(<Textarea resize="vertical" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveStyle({ resize: 'vertical' })
    })

    test('支持水平调整大小', () => {
      render(<Textarea resize="horizontal" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveStyle({ resize: 'horizontal' })
    })

    test('支持双向调整大小', () => {
      render(<Textarea resize="both" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveStyle({ resize: 'both' })
    })

    test('禁止调整大小', () => {
      render(<Textarea resize="none" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveStyle({ resize: 'none' })
    })

    test('默认为垂直调整大小', () => {
      render(<Textarea />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveStyle({ resize: 'vertical' })
    })
  })

  describe('事件处理', () => {
    test('onChange事件正确触发', async () => {
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'test')

      expect(handleChange).toHaveBeenCalled()
    })

    test('onFocus事件正确触发', async () => {
      const handleFocus = jest.fn()
      render(<Textarea onFocus={handleFocus} />)

      const textarea = screen.getByTestId('textarea')
      textarea.focus()

      await waitFor(() => {
        expect(handleFocus).toHaveBeenCalledTimes(1)
      })
    })

    test('onBlur事件正确触发', async () => {
      const handleBlur = jest.fn()
      render(<Textarea onBlur={handleBlur} />)

      const textarea = screen.getByTestId('textarea')
      textarea.focus()
      textarea.blur()

      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalledTimes(1)
      })
    })

    test('onInput事件正确触发', async () => {
      const handleInput = jest.fn()
      render(<Textarea onInput={handleInput} />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'test')

      expect(handleInput).toHaveBeenCalled()
    })

    test('禁用状态下不触发onChange事件', async () => {
      const handleChange = jest.fn()
      render(<Textarea disabled onChange={handleChange} />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'test')

      expect(handleChange).not.toHaveBeenCalled()
    })

    test('只读状态下不触发onChange事件', async () => {
      const handleChange = jest.fn()
      render(<Textarea readOnly onChange={handleChange} />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'test')

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('键盘交互', () => {
    test('支持Tab键导航', () => {
      render(<Textarea />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('tabIndex', '0')
    })

    test('Enter键创建新行', async () => {
      render(<Textarea />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'Line 1')
      await user.keyboard('{Enter}')
      await user.type(textarea, 'Line 2')

      expect(textarea).toHaveValue('Line 1\nLine 2')
    })

    test('支持Shift+Enter创建新行', async () => {
      render(<Textarea />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'Before Shift+Enter')
      await user.keyboard('{Shift>}{Enter}{/Shift}')
      await user.type(textarea, 'After Shift+Enter')

      expect(textarea).toHaveValue('Before Shift+Enter\nAfter Shift+Enter')
    })

    test('支持Tab键缩进', async () => {
      render(<Textarea />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'Hello{Tab}World')

      expect(textarea).toHaveValue('Hello\tWorld')
    })
  })

  describe('可访问性', () => {
    test('具有正确的ARIA属性', () => {
      render(
        <Textarea
          placeholder="输入描述"
          required
          error="描述不能为空"
          aria-label="描述输入框"
          aria-describedby="textarea-help"
        />
      )

      const textarea = screen.getByLabelText('描述输入框')
      expect(textarea).toHaveAttribute('aria-describedby', 'textarea-help')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
      expect(textarea).toHaveAttribute('required')
    })

    test('支持aria-invalid属性', () => {
      render(<Textarea aria-invalid="true" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
    })

    test('支持aria-multiline属性', () => {
      render(<Textarea aria-multiline="true" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('aria-multiline', 'true')
    })
  })

  describe('自动调整大小', () => {
    test('支持自动高度调整', () => {
      render(<Textarea autoResize />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toBeInTheDocument()
    })

    test('内容变化时自动调整高度', async () => {
      render(<Textarea autoResize />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'Line 1\nLine 2\nLine 3')

      // 实际组件应该自动调整高度
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
    })
  })

  describe('特殊功能', () => {
    test('支持自动对焦', () => {
      render(<Textarea autoFocus />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('autofocus')
    })

    test('支持自动完成', () => {
      render(<Textarea autoComplete="on" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('autocomplete', 'on')
    })

    test('支持拼写检查', () => {
      render(<Textarea spellCheck={false} />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('spellcheck', 'false')
    })
  })

  describe('验证功能', () => {
    test('支持自定义验证', async () => {
      const handleInvalid = jest.fn()
      render(<Textarea required onInvalid={handleInvalid} />)

      const textarea = screen.getByTestId('textarea')
      fireEvent.invalid(textarea)

      await waitFor(() => {
        expect(handleInvalid).toHaveBeenCalled()
      })
    })

    test('支持pattern验证', () => {
      render(<Textarea pattern="[A-Za-z\s]+" />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('pattern', '[A-Za-z\s]+')
    })
  })

  describe('性能优化', () => {
    test('正确使用React.memo', () => {
      const { rerender } = render(<Textarea placeholder="测试" />)
      const textarea = screen.getByTestId('textarea')

      rerender(<Textarea placeholder="测试" />)

      expect(textarea).toBeInTheDocument()
    })

    test('支持forwardRef', () => {
      const ref = { current: null }
      render(<Textarea ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })
  })

  describe('边界情况', () => {
    test('处理空内容', async () => {
      const handleChange = jest.fn()
      render(<Textarea value="有内容" onChange={handleChange} />)

      const textarea = screen.getByTestId('textarea')
      await user.clear(textarea)

      expect(textarea).toHaveValue('')
      expect(handleChange).toHaveBeenCalled()
    })

    test('处理超长内容', async () => {
      const longContent = 'A'.repeat(1000)
      render(<Textarea defaultValue={longContent} />)

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveValue(longContent)
    })

    test('同时使用多个约束属性', () => {
      render(
        <Textarea disabled readOnly required error="错误信息" maxLength={500} minLength={10} />
      )

      const textarea = screen.getByTestId('textarea')
      expect(textarea).toBeDisabled()
      expect(textarea).toHaveAttribute('readonly')
      expect(textarea).toHaveAttribute('required')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
      expect(textarea).toHaveAttribute('maxlength', '500')
      expect(textarea).toHaveAttribute('minlength', '10')
    })

    test('不提供必需的回调函数时不会报错', () => {
      expect(() => {
        render(<Textarea />)
      }).not.toThrow()
    })

    test('处理换行符', async () => {
      render(<Textarea />)

      const textarea = screen.getByTestId('textarea')
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3')

      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
    })
  })
})
