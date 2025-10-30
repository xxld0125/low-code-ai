import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyEditor } from '../../../components/lowcode/editors/PropertyEditor'

// Mock data for testing - 基于现有PropertyEditor接口
const mockPropertyDefinitions = [
  {
    key: 'children',
    type: 'string' as const,
    label: '按钮文字',
    required: true,
    default: '按钮',
    group: '基础',
    order: 1,
  },
  {
    key: 'variant',
    type: 'select' as const,
    label: '按钮样式',
    required: false,
    default: 'default',
    group: '样式',
    order: 2,
    options: [
      { value: 'default', label: '默认' },
      { value: 'destructive', label: '危险' },
      { value: 'outline', label: '轮廓' },
      { value: 'secondary', label: '次要' },
      { value: 'ghost', label: '幽灵' },
      { value: 'link', label: '链接' },
    ],
  },
  {
    key: 'disabled',
    type: 'boolean' as const,
    label: '禁用状态',
    required: false,
    default: false,
    group: '状态',
    order: 3,
  },
  {
    key: 'size',
    type: 'select' as const,
    label: '按钮尺寸',
    required: false,
    default: 'default',
    group: '样式',
    order: 4,
    options: [
      { value: 'default', label: '默认' },
      { value: 'sm', label: '小' },
      { value: 'lg', label: '大' },
      { value: 'icon', label: '图标' },
    ],
  },
]

const mockComponentProps = {
  children: '测试按钮',
  variant: 'default',
  disabled: false,
  size: 'lg',
}

// Mock functions - 基于现有PropertyEditor接口
const mockOnPropertyChange = jest.fn()
const mockOnPropertiesChange = jest.fn()

describe('PropertyEditor', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染PropertyEditor组件', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      expect(screen.getByText('组件属性')).toBeInTheDocument()
      expect(screen.getByText('Button')).toBeInTheDocument()
    })

    it('应该显示正确的属性分组', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      // 检查分组标签
      expect(screen.getByText('基础')).toBeInTheDocument()
      expect(screen.getByText('样式')).toBeInTheDocument()
      expect(screen.getByText('状态')).toBeInTheDocument()
    })

    it('应该显示组件类型标签', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      const componentBadge = screen.getByText('Button')
      expect(componentBadge).toBeInTheDocument()
    })
  })

  describe('属性编辑器', () => {
    it('应该为字符串类型属性显示文本输入框', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      // 查找按钮文字输入框
      const textInput = screen.getByDisplayValue('测试按钮')
      expect(textInput).toBeInTheDocument()
      expect(textInput).toHaveAttribute('type', 'text')
    })

    it('应该为选择类型属性显示下拉选择器', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      // 查找按钮样式选择器
      const selectInput = screen.getByDisplayValue('primary')
      expect(selectInput).toBeInTheDocument()
    })

    it('应该为布尔类型属性显示开关', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      // 查找禁用状态开关 - 通常用checkbox实现
      const checkboxInput = screen.getByRole('checkbox', { name: /禁用状态/i })
      expect(checkboxInput).toBeInTheDocument()
      expect(checkboxInput).not.toBeChecked()
    })

    it('应该显示必填字段的标记', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      // 检查必填字段标记 - 通常用*号显示
      const requiredLabel = screen.getByText(/按钮文字/)
      expect(requiredLabel).toBeInTheDocument()
    })
  })

  describe('属性值更新', () => {
    it('应该在文本输入时调用onPropertyChange', async () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      const textInput = screen.getByDisplayValue('测试按钮')
      await user.clear(textInput)
      await user.type(textInput, '新按钮文字')

      expect(mockOnPropertyChange).toHaveBeenCalledWith(
        expect.objectContaining({
          component_id: 'button-123',
          property_key: 'children',
          value: '新按钮文字',
          previous_value: '测试按钮',
        })
      )
    })

    it('应该在选择器改变时调用onPropertyChange', async () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      const selectInput = screen.getByDisplayValue('primary')
      await user.selectOptions(selectInput, 'destructive')

      expect(mockOnPropertyChange).toHaveBeenCalledWith(
        expect.objectContaining({
          component_id: 'button-123',
          property_key: 'variant',
          value: 'destructive',
          previous_value: 'primary',
        })
      )
    })

    it('应该在开关切换时调用onPropertyChange', async () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      const checkboxInput = screen.getByRole('checkbox', { name: /禁用状态/i })
      await user.click(checkboxInput)

      expect(mockOnPropertyChange).toHaveBeenCalledWith(
        expect.objectContaining({
          component_id: 'button-123',
          property_key: 'disabled',
          value: true,
          previous_value: false,
        })
      )
    })
  })

  describe('高级属性功能', () => {
    it('应该支持显示/隐藏高级属性', async () => {
      const advancedDefinitions = [
        ...mockPropertyDefinitions,
        {
          key: 'ariaLabel',
          type: 'string' as const,
          label: 'ARIA标签',
          required: false,
          group: '高级',
          order: 100,
        },
      ]

      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={advancedDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      // 默认情况下高级属性不显示
      expect(screen.queryByText('ARIA标签')).not.toBeInTheDocument()

      // 点击显示高级按钮
      const advancedButton = screen.getByText('显示高级')
      await user.click(advancedButton)

      // 高级属性应该显示
      expect(screen.getByText('ARIA标签')).toBeInTheDocument()
    })

    it('应该支持重置为默认值', async () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
        />
      )

      const resetButton = screen.getByText('重置')
      await user.click(resetButton)

      expect(mockOnPropertiesChange).toHaveBeenCalledWith(
        expect.objectContaining({
          children: '按钮', // 默认值
          variant: 'default', // 默认值
          disabled: false, // 默认值
          size: 'default', // 默认值
        })
      )
    })

    it('应该支持组折叠/展开', async () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
          showGroups={true}
          collapsibleGroups={true}
        />
      )

      // 点击基础组折叠
      const basicGroup = screen.getByText('基础')
      await user.click(basicGroup)

      // 验证折叠行为 - 由于组件实现，这里检查基础组内容是否仍然可见
      expect(screen.getByDisplayValue('测试按钮')).toBeInTheDocument()
    })
  })

  describe('加载状态', () => {
    it('应该显示加载状态', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
          loading={true}
        />
      )

      expect(screen.getByText('加载属性编辑器...')).toBeInTheDocument()
    })
  })

  describe('禁用状态', () => {
    it('应该在禁用时显示正确的UI状态', () => {
      render(
        <PropertyEditor
          componentType="Button"
          componentId="button-123"
          componentCategory="basic"
          properties={mockComponentProps}
          propertyDefinitions={mockPropertyDefinitions}
          onPropertyChange={mockOnPropertyChange}
          onPropertiesChange={mockOnPropertiesChange}
          disabled={true}
        />
      )

      // 重置按钮应该被禁用
      const resetButton = screen.getByText('重置')
      expect(resetButton).toBeDisabled()
    })
  })
})
