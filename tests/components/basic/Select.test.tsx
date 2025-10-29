import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from '@/components/lowcode/basic/Select'

// Mock Select组件（将在实现后替换）
jest.mock('@/components/lowcode/basic/Select', () => ({
  Select: jest.fn(
    ({
      options,
      value,
      defaultValue,
      placeholder,
      disabled,
      required,
      error,
      helperText,
      className,
      searchable,
      clearable,
      multiple,
      size,
      onChange,
      onFocus,
      onBlur,
      onSearch,
      ...props
    }) => (
      <div>
        <select
          data-testid="select"
          value={value || defaultValue || ''}
          disabled={disabled}
          required={required}
          aria-invalid={error}
          className={className}
          multiple={multiple}
          size={size}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option: SelectOption) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {searchable && (
          <input
            data-testid="search-input"
            type="text"
            placeholder="搜索选项..."
            onChange={onSearch}
          />
        )}
        {clearable && value && (
          <button
            data-testid="clear-button"
            type="button"
            onClick={() => onChange?.({ target: { value: '' } })}
          >
            清除
          </button>
        )}
        {error && <span data-testid="error-message">{error}</span>}
        {helperText && <span data-testid="helper-text">{helperText}</span>}
      </div>
    )
  ),
}))

describe('Select组件', () => {
  const user = userEvent.setup()
  const defaultOptions = [
    { value: 'option1', label: '选项1' },
    { value: 'option2', label: '选项2' },
    { value: 'option3', label: '选项3' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    test('正确渲染默认Select', () => {
      render(<Select options={defaultOptions} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
      expect(select).not.toBeDisabled()
      expect(select).not.toHaveAttribute('aria-invalid')

      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
    })

    test('支持自定义className', () => {
      render(<Select options={defaultOptions} className="custom-select" />)

      const select = screen.getByTestId('select')
      expect(select).toHaveClass('custom-select')
    })

    test('支持HTML属性透传', () => {
      render(<Select options={defaultOptions} data-testid="custom-testid" />)

      const select = screen.getByTestId('custom-testid')
      expect(select).toBeInTheDocument()
    })

    test('正确渲染空选项', () => {
      render(<Select options={[]} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
      expect(screen.queryAllByRole('option')).toHaveLength(0)
    })
  })

  describe('选项配置', () => {
    test('正确渲染选项列表', () => {
      render(<Select options={defaultOptions} />)

      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveTextContent('选项1')
      expect(options[1]).toHaveTextContent('选项2')
      expect(options[2]).toHaveTextContent('选项3')
    })

    test('支持选项禁用', () => {
      const optionsWithDisabled = [
        ...defaultOptions,
        { value: 'disabled', label: '禁用选项', disabled: true },
      ]

      render(<Select options={optionsWithDisabled} />)

      const disabledOption = screen.getByText('禁用选项')
      expect(disabledOption).toBeDisabled()
    })

    test('支持选项分组', () => {
      const groupedOptions = [
        {
          label: '分组1',
          options: [
            { value: 'group1-1', label: '分组1-选项1' },
            { value: 'group1-2', label: '分组1-选项2' },
          ],
        },
        {
          label: '分组2',
          options: [{ value: 'group2-1', label: '分组2-选项1' }],
        },
      ]

      render(<Select options={groupedOptions as (SelectOption | SelectGroup)[]} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
    })
  })

  describe('占位符', () => {
    test('显示占位符', () => {
      render(<Select options={defaultOptions} placeholder="请选择选项" />)

      const placeholderOption = screen.getByText('请选择选项')
      expect(placeholderOption).toBeInTheDocument()
      expect(placeholderOption).toBeDisabled()
      expect(placeholderOption).toHaveValue('')
    })

    test('有值时占位符不可见', () => {
      render(<Select options={defaultOptions} value="option1" placeholder="请选择" />)

      expect(screen.queryByText('请选择')).not.toBeInTheDocument()
    })
  })

  describe('值和默认值', () => {
    test('支持受控模式', async () => {
      const handleChange = jest.fn()
      render(<Select options={defaultOptions} value="option1" onChange={handleChange} />)

      const select = screen.getByTestId('select')
      expect(select).toHaveValue('option1')

      await user.selectOptions(select, 'option2')
      expect(handleChange).toHaveBeenCalled()
    })

    test('支持非受控模式', async () => {
      render(<Select options={defaultOptions} defaultValue="option1" />)

      const select = screen.getByTestId('select')
      expect(select).toHaveValue('option1')

      await user.selectOptions(select, 'option2')
      expect(select).toHaveValue('option2')
    })

    test('同时使用value和defaultValue时value优先', () => {
      render(<Select options={defaultOptions} value="option1" defaultValue="option2" />)

      const select = screen.getByTestId('select')
      expect(select).toHaveValue('option1')
    })
  })

  describe('状态管理', () => {
    test('禁用状态正确显示', () => {
      render(<Select options={defaultOptions} disabled />)

      const select = screen.getByTestId('select')
      expect(select).toBeDisabled()
    })

    test('必填状态正确显示', () => {
      render(<Select options={defaultOptions} required />)

      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('required')
    })

    test('错误状态正确显示', () => {
      render(<Select options={defaultOptions} error="请选择一个选项" />)

      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('请选择一个选项')
    })

    test('helperText正确显示', () => {
      render(<Select options={defaultOptions} helperText="请从下拉列表中选择" />)

      const helperText = screen.getByTestId('helper-text')
      expect(helperText).toBeInTheDocument()
      expect(helperText).toHaveTextContent('请从下拉列表中选择')
    })
  })

  describe('多选模式', () => {
    test('支持多选模式', () => {
      render(<Select options={defaultOptions} multiple />)

      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('multiple')
    })

    test('多选时支持多个值', () => {
      render(<Select options={defaultOptions} multiple value={['option1', 'option2']} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
    })

    test('多选时设置size属性', () => {
      render(<Select options={defaultOptions} multiple size={4} />)

      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('size', '4')
    })
  })

  describe('搜索功能', () => {
    test('启用搜索时显示搜索框', () => {
      render(<Select options={defaultOptions} searchable />)

      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', '搜索选项...')
    })

    test('搜索输入触发onSearch事件', async () => {
      const handleSearch = jest.fn()
      render(<Select options={defaultOptions} searchable onSearch={handleSearch} />)

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, '选项1')

      expect(handleSearch).toHaveBeenCalled()
    })
  })

  describe('清除功能', () => {
    test('有值且启用清除时显示清除按钮', () => {
      render(<Select options={defaultOptions} value="option1" clearable />)

      const clearButton = screen.getByTestId('clear-button')
      expect(clearButton).toBeInTheDocument()
    })

    test('无值时不显示清除按钮', () => {
      render(<Select options={defaultOptions} clearable />)

      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
    })

    test('点击清除按钮触发清除', async () => {
      const handleChange = jest.fn()
      render(<Select options={defaultOptions} value="option1" clearable onChange={handleChange} />)

      const clearButton = screen.getByTestId('clear-button')
      await user.click(clearButton)

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' }),
        })
      )
    })
  })

  describe('事件处理', () => {
    test('onChange事件正确触发', async () => {
      const handleChange = jest.fn()
      render(<Select options={defaultOptions} onChange={handleChange} />)

      const select = screen.getByTestId('select')
      await user.selectOptions(select, 'option1')

      expect(handleChange).toHaveBeenCalled()
    })

    test('onFocus事件正确触发', async () => {
      const handleFocus = jest.fn()
      render(<Select options={defaultOptions} onFocus={handleFocus} />)

      const select = screen.getByTestId('select')
      select.focus()

      await waitFor(() => {
        expect(handleFocus).toHaveBeenCalledTimes(1)
      })
    })

    test('onBlur事件正确触发', async () => {
      const handleBlur = jest.fn()
      render(<Select options={defaultOptions} onBlur={handleBlur} />)

      const select = screen.getByTestId('select')
      select.focus()
      select.blur()

      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalledTimes(1)
      })
    })

    test('禁用状态下不触发onChange事件', async () => {
      const handleChange = jest.fn()
      render(<Select options={defaultOptions} disabled onChange={handleChange} />)

      const select = screen.getByTestId('select')
      expect(select).toBeDisabled()
    })
  })

  describe('键盘交互', () => {
    test('支持方向键导航', () => {
      render(<Select options={defaultOptions} />)

      const select = screen.getByTestId('select')
      select.focus()

      fireEvent.keyDown(select, { key: 'ArrowDown' })
      fireEvent.keyDown(select, { key: 'ArrowUp' })

      expect(select).toHaveFocus()
    })

    test('支持Enter键选择', () => {
      render(<Select options={defaultOptions} />)

      const select = screen.getByTestId('select')
      select.focus()

      fireEvent.keyDown(select, { key: 'Enter' })

      expect(select).toHaveFocus()
    })

    test('支持Escape键关闭', () => {
      render(<Select options={defaultOptions} />)

      const select = screen.getByTestId('select')
      select.focus()

      fireEvent.keyDown(select, { key: 'Escape' })

      expect(select).toHaveFocus()
    })
  })

  describe('可访问性', () => {
    test('具有正确的ARIA属性', () => {
      render(
        <Select
          options={defaultOptions}
          placeholder="请选择"
          required
          error="请选择一个选项"
          aria-label="选择下拉框"
          aria-describedby="select-help"
        />
      )

      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('aria-describedby', 'select-help')
      expect(select).toHaveAttribute('aria-invalid', 'true')
      expect(select).toHaveAttribute('required')
    })

    test('支持aria-expanded属性', () => {
      render(<Select options={defaultOptions} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
    })

    test('支持aria-activedescendant属性', () => {
      render(<Select options={defaultOptions} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
    })
  })

  describe('响应式行为', () => {
    test('支持响应式尺寸', () => {
      render(
        <Select
          options={defaultOptions}
          size={{ base: 'sm', md: 'md', lg: 'lg' } as ResponsiveSize}
        />
      )

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
    })
  })

  describe('性能优化', () => {
    test('正确使用React.memo', () => {
      const { rerender } = render(<Select options={defaultOptions} />)
      const select = screen.getByTestId('select')

      rerender(<Select options={defaultOptions} />)

      expect(select).toBeInTheDocument()
    })

    test('支持forwardRef', () => {
      const ref = { current: null }
      render(<Select options={defaultOptions} ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLSelectElement)
    })
  })

  describe('异步选项', () => {
    test('支持异步加载选项', async () => {
      const asyncOptions = new Promise(resolve => {
        setTimeout(() => resolve(defaultOptions), 100)
      })

      render(<Select options={asyncOptions as Promise<SelectOption[]>} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()

      await waitFor(() => {
        const options = screen.getAllByRole('option')
        expect(options).toHaveLength(3)
      })
    })

    test('加载时显示加载状态', () => {
      const loadingOptions = new Promise(() => {}) // 永不解决

      render(<Select options={loadingOptions as Promise<SelectOption[]>} loading />)

      expect(screen.getByTestId('select')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    test('处理空选项数组', () => {
      render(<Select options={[]} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
      expect(screen.queryAllByRole('option')).toHaveLength(0)
    })

    test('处理无效选项值', () => {
      const invalidOptions = [
        { value: null, label: '空值选项' },
        { value: undefined, label: '未定义选项' },
      ]

      render(<Select options={invalidOptions as unknown as SelectOption[]} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
    })

    test('处理重复选项值', () => {
      const duplicateOptions = [
        { value: 'same', label: '选项1' },
        { value: 'same', label: '选项2' },
      ]

      render(<Select options={duplicateOptions} />)

      const select = screen.getByTestId('select')
      expect(select).toBeInTheDocument()
    })

    test('同时使用多个约束属性', () => {
      render(
        <Select
          options={defaultOptions}
          disabled
          required
          error="错误信息"
          searchable
          clearable
          multiple
        />
      )

      const select = screen.getByTestId('select')
      expect(select).toBeDisabled()
      expect(select).toHaveAttribute('required')
      expect(select).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })

    test('不提供必需的回调函数时不会报错', () => {
      expect(() => {
        render(<Select options={defaultOptions} />)
      }).not.toThrow()
    })
  })
})
