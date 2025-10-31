/**
 * PropertyEditor 组件简化测试
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-31
 * 专门用于测试核心逻辑，避免复杂的UI组件mock问题
 */

import { renderHook, act } from '@testing-library/react'
import { useState } from 'react'
import { PropertyEditorCore } from '../../../components/lowcode/editors/PropertyEditorCore'

// Mock property definitions for testing
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
]

const mockComponentProps = {
  children: '测试按钮',
  variant: 'default',
  disabled: false,
}

describe('PropertyEditorCore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('属性分组逻辑', () => {
    it('应该正确按组分类属性', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyGroups(mockPropertyDefinitions, {
          showGroups: true,
          groupOrder: ['基础', '样式', '状态'],
        })
      )

      expect(result.current.groups).toEqual({
        '基础': [mockPropertyDefinitions[0]],
        '样式': [mockPropertyDefinitions[1]],
        '状态': [mockPropertyDefinitions[2]],
      })
    })

    it('应该正确过滤高级属性', () => {
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

      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyGroups(advancedDefinitions, {
          showGroups: true,
          showAdvanced: false,
          advancedGroups: ['高级'],
        })
      )

      expect(result.current.groups).toEqual({
        '基础': [mockPropertyDefinitions[0]],
        '样式': [mockPropertyDefinitions[1]],
        '状态': [mockPropertyDefinitions[2]],
      })
      expect(result.current.groups['高级']).toBeUndefined()
    })

    it('应该支持自定义组排序', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyGroups(mockPropertyDefinitions, {
          showGroups: true,
          groupOrder: ['状态', '样式', '基础'], // 反向顺序
        })
      )

      const groupOrder = Object.keys(result.current.groups)
      expect(groupOrder).toEqual(['状态', '样式', '基础'])
    })
  })

  describe('属性值验证逻辑', () => {
    it('应该验证必填字段', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyValidation(mockPropertyDefinitions, mockComponentProps)
      )

      const validation = result.current.validateProperty('children', '')
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('按钮文字不能为空')
    })

    it('应该验证选择字段的有效值', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyValidation(mockPropertyDefinitions, mockComponentProps)
      )

      const validation = result.current.validateProperty('variant', 'invalid-value')
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('按钮样式选择了无效的选项')
    })

    it('应该验证布尔字段', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyValidation(mockPropertyDefinitions, mockComponentProps)
      )

      const validation1 = result.current.validateProperty('disabled', true)
      expect(validation1.isValid).toBe(true)

      const validation2 = result.current.validateProperty('disabled', false)
      expect(validation2.isValid).toBe(true)
    })

    it('应该支持自定义验证规则', () => {
      const customRules = {
        children: [
          {
            rule: 'minLength',
            value: 2,
            message: '按钮文字至少需要2个字符',
          },
        ],
      }

      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyValidation(mockPropertyDefinitions, mockComponentProps, customRules)
      )

      const validation = result.current.validateProperty('children', 'a')
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('按钮文字至少需要2个字符')
    })
  })

  describe('属性变更处理逻辑', () => {
    it('应该正确处理属性变更', () => {
      const mockOnChange = jest.fn()

      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyChange(mockOnChange, {
          componentId: 'test-component',
          componentType: 'Button',
        })
      )

      act(() => {
        result.current.handlePropertyChange('children', '新按钮文字', '测试按钮')
      })

      expect(mockOnChange).toHaveBeenCalledWith({
        component_id: 'test-component',
        component_type: 'Button',
        property_key: 'children',
        value: '新按钮文字',
        previous_value: '测试按钮',
        timestamp: expect.any(Number),
      })
    })

    it('应该支持批量属性变更', () => {
      const mockOnBatchChange = jest.fn()

      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyBatchChange(mockOnBatchChange, {
          componentId: 'test-component',
        })
      )

      const changes = {
        children: '新按钮文字',
        variant: 'destructive',
        disabled: true,
      }

      act(() => {
        result.current.handleBatchChange(changes, mockComponentProps)
      })

      expect(mockOnBatchChange).toHaveBeenCalledWith({
        component_id: 'test-component',
        changes,
        previous_values: mockComponentProps,
        timestamp: expect.any(Number),
      })
    })
  })

  describe('默认值处理逻辑', () => {
    it('应该正确获取属性的默认值', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyDefaults(mockPropertyDefinitions)
      )

      expect(result.current.getDefaultValue('children')).toBe('按钮')
      expect(result.current.getDefaultValue('variant')).toBe('default')
      expect(result.current.getDefaultValue('disabled')).toBe(false)
      expect(result.current.getDefaultValue('nonexistent')).toBeUndefined()
    })

    it('应该重置所有属性为默认值', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyDefaults(mockPropertyDefinitions)
      )

      const defaultValues = result.current.resetToDefaults()
      expect(defaultValues).toEqual({
        children: '按钮',
        variant: 'default',
        disabled: false,
      })
    })

    it('应该重置单个属性为默认值', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyDefaults(mockPropertyDefinitions)
      )

      const resetValue = result.current.resetPropertyToDefault('children')
      expect(resetValue).toBe('按钮')
    })
  })

  describe('属性搜索和过滤逻辑', () => {
    it('应该根据关键词搜索属性', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertySearch(mockPropertyDefinitions)
      )

      act(() => {
        result.current.setSearchTerm('文字')
      })

      const filtered = result.current.filteredProperties
      expect(filtered).toHaveLength(1)
      expect(filtered[0].key).toBe('children')
    })

    it('应该根据组过滤属性', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertySearch(mockPropertyDefinitions)
      )

      act(() => {
        result.current.setGroupFilter('样式')
      })

      const filtered = result.current.filteredProperties
      expect(filtered).toHaveLength(1)
      expect(filtered[0].key).toBe('variant')
    })

    it('应该根据类型过滤属性', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertySearch(mockPropertyDefinitions)
      )

      act(() => {
        result.current.setTypeFilter('boolean')
      })

      const filtered = result.current.filteredProperties
      expect(filtered).toHaveLength(1)
      expect(filtered[0].key).toBe('disabled')
    })
  })

  describe('属性依赖关系逻辑', () => {
    it('应该处理属性之间的依赖关系', () => {
      const definitionsWithDependencies = [
        ...mockPropertyDefinitions,
        {
          key: 'confirmationMessage',
          type: 'string' as const,
          label: '确认消息',
          required: false,
          group: '高级',
          order: 4,
          dependencies: {
            disabled: true, // 只有当disabled为true时才显示
          },
        },
      ]

      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyDependencies(definitionsWithDependencies, mockComponentProps)
      )

      // disabled为false时，confirmationMessage应该被隐藏
      expect(result.current.isPropertyVisible('confirmationMessage')).toBe(false)

      // 当disabled设置为true时，confirmationMessage应该变得可见
      act(() => {
        result.current.updatePropertyValue('disabled', true)
      })

      expect(result.current.isPropertyVisible('confirmationMessage')).toBe(true)
    })

    it('应该处理复杂的依赖条件', () => {
      const definitionsWithComplexDependencies = [
        ...mockPropertyDefinitions,
        {
          key: 'customAction',
          type: 'string' as const,
          label: '自定义操作',
          required: false,
          group: '高级',
          order: 4,
          dependencies: {
            variant: ['destructive', 'outline'], // 特定变体时显示
            disabled: false, // 且未禁用时显示
          },
        },
      ]

      const props1 = { ...mockComponentProps, variant: 'default', disabled: false }
      const { result: result1 } = renderHook(() =>
        PropertyEditorCore.usePropertyDependencies(definitionsWithComplexDependencies, props1)
      )

      expect(result1.current.isPropertyVisible('customAction')).toBe(false)

      const props2 = { ...mockComponentProps, variant: 'destructive', disabled: false }
      const { result: result2 } = renderHook(() =>
        PropertyEditorCore.usePropertyDependencies(definitionsWithComplexDependencies, props2)
      )

      expect(result2.current.isPropertyVisible('customAction')).toBe(true)
    })
  })

  describe('属性导入导出逻辑', () => {
    it('应该导出属性配置为JSON', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyImportExport(mockPropertyDefinitions, mockComponentProps)
      )

      const exported = result.current.exportToJSON()
      const parsed = JSON.parse(exported)

      expect(parsed).toEqual({
        version: '1.0.0',
        timestamp: expect.any(String),
        component: {
          type: expect.any(String),
          id: expect.any(String),
        },
        properties: mockComponentProps,
        metadata: {
          totalProperties: 3,
          requiredProperties: 1,
          groups: ['基础', '样式', '状态'],
        },
      })
    })

    it('应该从JSON导入属性配置', () => {
      const importData = {
        properties: {
          children: '导入的按钮',
          variant: 'outline',
          disabled: true,
        },
      }

      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyImportExport(mockPropertyDefinitions, {})
      )

      const imported = result.current.importFromJSON(JSON.stringify(importData))
      expect(imported).toEqual(importData.properties)
    })

    it('应该处理无效的导入数据', () => {
      const { result } = renderHook(() =>
        PropertyEditorCore.usePropertyImportExport(mockPropertyDefinitions, {})
      )

      expect(() => {
        result.current.importFromJSON('invalid json')
      }).toThrow('无效的JSON格式')

      expect(() => {
        result.current.importFromJSON('{}')
      }).toThrow('导入数据中缺少properties字段')
    })
  })
})