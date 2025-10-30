import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StyleEditor } from '../../../components/lowcode/editors/StyleEditor'

// Mock style configuration data
const mockComponentStyles = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  padding: '12px 24px',
  margin: '8px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  lineHeight: '1.5',
}

const mockComponentDefinition = {
  id: 'component-basic-button',
  name: 'Button',
  category: 'basic',
  style_schema: {
    groups: [
      {
        id: 'layout',
        name: '布局',
        order: 1,
        properties: [
          {
            id: 'display',
            name: 'display',
            type: 'select' as const,
            label: '显示方式',
            required: false,
            default_value: 'inline-block',
            options: [
              { value: 'block', label: '块级' },
              { value: 'inline-block', label: '行内块' },
              { value: 'inline', label: '行内' },
              { value: 'flex', label: '弹性' },
              { value: 'grid', label: '网格' },
              { value: 'none', label: '隐藏' },
            ],
            editor_config: { type: 'select' },
          },
          {
            id: 'width',
            name: 'width',
            type: 'size' as const,
            label: '宽度',
            required: false,
            editor_config: {
              type: 'size',
              units: ['px', '%', 'rem', 'em', 'auto'],
              min: 0,
            },
          },
        ],
      },
      {
        id: 'colors',
        name: '颜色',
        order: 2,
        properties: [
          {
            id: 'color',
            name: 'color',
            type: 'color' as const,
            label: '文字颜色',
            required: false,
            editor_config: {
              type: 'color',
              presets: [
                '#000000',
                '#ffffff',
                '#ef4444',
                '#f97316',
                '#eab308',
                '#22c55e',
                '#06b6d4',
                '#3b82f6',
                '#8b5cf6',
                '#ec4899',
                '#6b7280',
              ],
            },
          },
          {
            id: 'backgroundColor',
            name: 'backgroundColor',
            type: 'color' as const,
            label: '背景颜色',
            required: false,
            editor_config: {
              type: 'color',
              presets: [
                '#000000',
                '#ffffff',
                '#fef2f2',
                '#fef3c7',
                '#f0fdf4',
                '#ecfeff',
                '#eff6ff',
                '#faf5ff',
                '#6b7280',
                '#d1d5db',
              ],
            },
          },
        ],
      },
      {
        id: 'typography',
        name: '文字',
        order: 3,
        properties: [
          {
            id: 'fontSize',
            name: 'fontSize',
            type: 'size' as const,
            label: '字体大小',
            required: false,
            editor_config: {
              type: 'size',
              units: ['px', 'rem', 'em'],
              min: 1,
            },
          },
          {
            id: 'fontWeight',
            name: 'fontWeight',
            type: 'select' as const,
            label: '字体粗细',
            required: false,
            default_value: '400',
            options: [
              { value: '100', label: '极细' },
              { value: '300', label: '细' },
              { value: '400', label: '正常' },
              { value: '500', label: '中等' },
              { value: '600', label: '半粗' },
              { value: '700', label: '粗' },
              { value: '900', label: '极粗' },
            ],
            editor_config: { type: 'select' },
          },
        ],
      },
      {
        id: 'spacing',
        name: '间距',
        order: 4,
        properties: [
          {
            id: 'margin',
            name: 'margin',
            type: 'spacing' as const,
            label: '外边距',
            required: false,
            editor_config: {
              type: 'spacing',
              directions: ['top', 'right', 'bottom', 'left'],
              units: ['px', 'rem', 'em'],
            },
          },
          {
            id: 'padding',
            name: 'padding',
            type: 'spacing' as const,
            label: '内边距',
            required: false,
            editor_config: {
              type: 'spacing',
              directions: ['top', 'right', 'bottom', 'left'],
              units: ['px', 'rem', 'em'],
            },
          },
        ],
      },
      {
        id: 'borders',
        name: '边框',
        order: 5,
        properties: [
          {
            id: 'border',
            name: 'border',
            type: 'border' as const,
            label: '边框',
            required: false,
            editor_config: {
              type: 'border',
              style: {
                type: 'select',
                options: [
                  { value: 'none', label: '无边框' },
                  { value: 'solid', label: '实线' },
                  { value: 'dashed', label: '虚线' },
                  { value: 'dotted', label: '点线' },
                  { value: 'double', label: '双线' },
                ],
              },
              width: {
                type: 'number',
                min: 0,
                max: 10,
              },
              color: {
                type: 'color',
              },
            },
          },
          {
            id: 'borderRadius',
            name: 'borderRadius',
            type: 'size' as const,
            label: '圆角',
            required: false,
            editor_config: {
              type: 'size',
              units: ['px', '%', 'rem'],
              min: 0,
            },
          },
        ],
      },
      {
        id: 'effects',
        name: '效果',
        order: 6,
        properties: [
          {
            id: 'boxShadow',
            name: 'boxShadow',
            type: 'shadow' as const,
            label: '阴影',
            required: false,
            editor_config: {
              type: 'shadow',
              presets: [
                {
                  value: 'none',
                  label: '无阴影',
                },
                {
                  value: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  label: '小阴影',
                },
                {
                  value: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  label: '中等阴影',
                },
                {
                  value: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  label: '大阴影',
                },
              ],
              custom: true,
            },
          },
        ],
      },
    ],
  },
}

// Mock functions
const mockOnStyleChange = jest.fn()
const mockOnValidationError = jest.fn()
const mockOnPreviewStyle = jest.fn()

describe('StyleEditor', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染StyleEditor组件', () => {
      render(
        <StyleEditor
          componentDefinition={mockComponentDefinition}
          componentStyles={mockComponentStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
        />
      )

      expect(screen.getByText('样式配置')).toBeInTheDocument()
      expect(screen.getByText('Button')).toBeInTheDocument()
    })

    it('应该显示所有样式分组', () => {
      render(
        <StyleEditor
          componentDefinition={mockComponentDefinition}
          componentStyles={mockComponentStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
        />
      )

      expect(screen.getByText('布局')).toBeInTheDocument()
      expect(screen.getByText('间距')).toBeInTheDocument()
      expect(screen.getByText('文字')).toBeInTheDocument()
      expect(screen.getByText('颜色')).toBeInTheDocument()
      expect(screen.getByText('边框')).toBeInTheDocument()
      expect(screen.getByText('效果')).toBeInTheDocument()
    })

    it('应该显示组件类型标签', () => {
      render(
        <StyleEditor
          componentDefinition={mockComponentDefinition}
          componentStyles={mockComponentStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
        />
      )

      // 检查组件类型标签
      expect(screen.getByText('Button')).toBeInTheDocument()
    })
  })

  describe('基础功能', () => {
    it('应该支持重置样式', async () => {
      render(
        <StyleEditor
          componentDefinition={mockComponentDefinition}
          componentStyles={mockComponentStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
        />
      )

      const resetButton = screen.getByText('重置')
      await user.click(resetButton)

      expect(mockOnStyleChange).toHaveBeenCalled()
    })

    it('应该支持响应式断点切换', async () => {
      render(
        <StyleEditor
          componentDefinition={mockComponentDefinition}
          componentStyles={mockComponentStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
        />
      )

      // 检查默认断点
      expect(screen.getByText('桌面')).toBeInTheDocument()

      // 切换到平板断点
      const tabletButton = screen.getByText('平板')
      await user.click(tabletButton)

      expect(screen.getByText('平板')).toBeInTheDocument()
    })
  })

  describe('加载状态', () => {
    it('应该显示加载状态', () => {
      render(
        <StyleEditor
          componentDefinition={mockComponentDefinition}
          componentStyles={mockComponentStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
          loading={true}
        />
      )

      expect(screen.getByText('加载样式编辑器...')).toBeInTheDocument()
    })
  })

  describe('错误处理', () => {
    it('应该处理组件定义缺失', () => {
      render(
        <StyleEditor
          componentDefinition={null}
          componentStyles={mockComponentStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
        />
      )

      expect(screen.getByText('该组件不支持样式配置')).toBeInTheDocument()
    })

    it('应该处理无效样式值', async () => {
      const invalidStyles = {
        ...mockComponentStyles,
        color: 'invalid-color-value',
        fontSize: 'invalid-size-value',
      }

      render(
        <StyleEditor
          componentDefinition={mockComponentDefinition}
          componentStyles={invalidStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
        />
      )

      // 等待验证错误处理
      await waitFor(() => {
        expect(mockOnValidationError).toHaveBeenCalled()
      })
    })

    it('应该在禁用状态下正确工作', () => {
      render(
        <StyleEditor
          componentDefinition={mockComponentDefinition}
          componentStyles={mockComponentStyles}
          onStyleChange={mockOnStyleChange}
          onValidationError={mockOnValidationError}
          onPreviewStyle={mockOnPreviewStyle}
          disabled={true}
        />
      )

      // 重置按钮应该被禁用
      const resetButton = screen.getByText('重置')
      expect(resetButton).toBeDisabled()
    })
  })
})
