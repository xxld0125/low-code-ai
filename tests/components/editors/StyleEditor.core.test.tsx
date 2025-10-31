/**
 * StyleEditor 组件核心逻辑测试
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-31
 * 专门用于测试样式编辑器的核心逻辑
 */

import { renderHook, act } from '@testing-library/react'
import { StyleEditorCore } from '../../../components/lowcode/editors/StyleEditorCore'

// Mock style schema for testing
const mockStyleSchema = {
  groups: [
    {
      id: 'layout',
      name: '布局',
      order: 1,
      properties: [
        {
          id: 'display',
          name: 'display',
          type: 'select',
          label: '显示方式',
          required: false,
          default_value: 'block',
          options: [
            { value: 'block', label: '块级' },
            { value: 'inline-block', label: '行内块' },
            { value: 'flex', label: '弹性' },
          ],
          editor_config: { type: 'select' },
        },
        {
          id: 'width',
          name: 'width',
          type: 'size',
          label: '宽度',
          required: false,
          editor_config: {
            type: 'size',
            units: ['px', '%', 'rem', 'auto'],
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
          id: 'backgroundColor',
          name: 'backgroundColor',
          type: 'color',
          label: '背景颜色',
          required: false,
          editor_config: {
            type: 'color',
            presets: ['#ffffff', '#000000', '#3b82f6'],
          },
        },
        {
          id: 'color',
          name: 'color',
          type: 'color',
          label: '文字颜色',
          required: false,
          editor_config: {
            type: 'color',
            presets: ['#000000', '#ffffff', '#ef4444'],
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
          type: 'size',
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
          type: 'select',
          label: '字体粗细',
          required: false,
          default_value: '400',
          options: [
            { value: '400', label: '正常' },
            { value: '600', label: '半粗' },
            { value: '700', label: '粗' },
          ],
        },
      ],
    },
  ],
}

const mockStyles = {
  display: 'flex',
  width: '100%',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
}

describe('StyleEditorCore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('样式分组逻辑', () => {
    it('应该正确解析样式分组', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleGroups(mockStyleSchema)
      )

      expect(result.current.groups).toHaveLength(3)
      expect(result.current.groups[0].name).toBe('布局')
      expect(result.current.groups[1].name).toBe('颜色')
      expect(result.current.groups[2].name).toBe('文字')
    })

    it('应该按顺序排列属性', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleGroups(mockStyleSchema)
      )

      const layoutGroup = result.current.groups[0]
      expect(layoutGroup.properties[0].id).toBe('display')
      expect(layoutGroup.properties[1].id).toBe('width')
    })

    it('应该根据ID获取组', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleGroups(mockStyleSchema)
      )

      const layoutGroup = result.current.getGroupById('layout')
      expect(layoutGroup?.name).toBe('布局')
      expect(layoutGroup?.properties).toHaveLength(2)

      const nonExistentGroup = result.current.getGroupById('nonexistent')
      expect(nonExistentGroup).toBeNull()
    })

    it('应该根据ID获取属性', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleGroups(mockStyleSchema)
      )

      const widthProperty = result.current.getPropertyById('width')
      expect(widthProperty?.label).toBe('宽度')
      expect(widthProperty?.type).toBe('size')

      const nonExistentProperty = result.current.getPropertyById('nonexistent')
      expect(nonExistentProperty).toBeNull()
    })

    it('应该处理空的样式定义', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleGroups(null)
      )

      expect(result.current.groups).toHaveLength(0)
      expect(result.current.getGroupById('layout')).toBeNull()
      expect(result.current.getPropertyById('width')).toBeNull()
    })
  })

  describe('样式验证逻辑', () => {
    const styleDefinitions = mockStyleSchema.groups.flatMap(group => group.properties)

    it('应该验证必填字段', () => {
      const requiredDefinitions = styleDefinitions.map(def => ({
        ...def,
        required: true,
      }))

      const { result } = renderHook(() =>
        StyleEditorCore.useStyleValidation(requiredDefinitions)
      )

      const validation = result.current.validateStyleValue(requiredDefinitions[0], '')
      expect(validation.isValid).toBe(false)
      expect(validation.errors[0]).toContain('不能为空')
    })

    it('应该验证颜色值', () => {
      const colorDefinition = styleDefinitions.find(def => def.type === 'color')!

      const { result } = renderHook(() =>
        StyleEditorCore.useStyleValidation([colorDefinition])
      )

      // 有效的颜色值
      const validValidation = result.current.validateStyleValue(colorDefinition, '#3b82f6')
      expect(validValidation.isValid).toBe(true)

      // 无效的颜色值
      const invalidValidation = result.current.validateStyleValue(colorDefinition, 'invalid-color')
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.errors[0]).toContain('有效的颜色值')
    })

    it('应该验证尺寸值', () => {
      const sizeDefinition = styleDefinitions.find(def => def.type === 'size')!

      const { result } = renderHook(() =>
        StyleEditorCore.useStyleValidation([sizeDefinition])
      )

      // 有效的尺寸值
      const validValidation = result.current.validateStyleValue(sizeDefinition, '16px')
      expect(validValidation.isValid).toBe(true)

      // 无效的尺寸值
      const invalidValidation = result.current.validateStyleValue(sizeDefinition, 'invalid-size')
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.errors[0]).toContain('有效的尺寸值')
    })

    it('应该验证数字值', () => {
      const numberDefinition = {
        ...styleDefinitions[0],
        type: 'number',
        editor_config: { min: 0, max: 100 },
      }

      const { result } = renderHook(() =>
        StyleEditorCore.useStyleValidation([numberDefinition])
      )

      // 有效的数字值
      const validValidation = result.current.validateStyleValue(numberDefinition, 50)
      expect(validValidation.isValid).toBe(true)

      // 超出范围的值
      const minValidation = result.current.validateStyleValue(numberDefinition, -10)
      expect(minValidation.isValid).toBe(false)
      expect(minValidation.errors[0]).toContain('不能小于 0')

      const maxValidation = result.current.validateStyleValue(numberDefinition, 150)
      expect(maxValidation.isValid).toBe(false)
      expect(maxValidation.errors[0]).toContain('不能大于 100')
    })

    it('应该验证选择值', () => {
      const selectDefinition = styleDefinitions.find(def => def.type === 'select')!

      const { result } = renderHook(() =>
        StyleEditorCore.useStyleValidation([selectDefinition])
      )

      // 有效的选择值
      const validValidation = result.current.validateStyleValue(selectDefinition, 'flex')
      expect(validValidation.isValid).toBe(true)

      // 无效的选择值
      const invalidValidation = result.current.validateStyleValue(selectDefinition, 'invalid-option')
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.errors[0]).toContain('无效的选项')
    })

    it('应该验证所有样式', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleValidation(styleDefinitions)
      )

      const allValidations = result.current.validateAllStyles(mockStyles)
      expect(Object.keys(allValidations)).toHaveLength(styleDefinitions.length)

      // 所有验证都应该通过
      Object.values(allValidations).forEach(validation => {
        expect(validation.isValid).toBe(true)
      })
    })
  })

  describe('响应式样式管理', () => {
    it('应该管理多个断点的样式', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useResponsiveStyles({}, StyleEditorCore.DEFAULT_BREAKPOINTS)
      )

      // 初始状态
      expect(result.current.currentBreakpoint.id).toBe('mobile')
      expect(result.current.styles).toEqual({})

      // 更新样式
      act(() => {
        result.current.updateStyle('mobile', 'width', '100%')
        result.current.updateStyle('desktop', 'width', '1200px')
      })

      expect(result.current.styles.mobile.width).toBe('100%')
      expect(result.current.styles.desktop.width).toBe('1200px')
    })

    it('应该切换当前断点', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useResponsiveStyles({}, StyleEditorCore.DEFAULT_BREAKPOINTS)
      )

      act(() => {
        result.current.setCurrentBreakpoint(StyleEditorCore.DEFAULT_BREAKPOINTS[1]) // tablet
      })

      expect(result.current.currentBreakpoint.id).toBe('tablet')
    })

    it('应该合并断点样式', () => {
      const initialStyles = {
        mobile: { width: '100%', fontSize: '14px' },
        desktop: { width: '1200px' },
      }

      const { result } = renderHook(() =>
        StyleEditorCore.useResponsiveStyles(initialStyles, StyleEditorCore.DEFAULT_BREAKPOINTS)
      )

      const currentStyles = result.current.getCurrentStyles()
      expect(currentStyles.width).toBe('1200px') // 桌面端覆盖移动端
      expect(currentStyles.fontSize).toBe('14px') // 保持移动端的设置
    })

    it('应该获取特定断点的样式', () => {
      const initialStyles = {
        mobile: { width: '100%' },
        desktop: { width: '1200px' },
      }

      const { result } = renderHook(() =>
        StyleEditorCore.useResponsiveStyles(initialStyles, StyleEditorCore.DEFAULT_BREAKPOINTS)
      )

      const mobileStyles = result.current.getStyleAtBreakpoint('mobile')
      expect(mobileStyles.width).toBe('100%')

      const desktopStyles = result.current.getStyleAtBreakpoint('desktop')
      expect(desktopStyles.width).toBe('1200px')
    })

    it('应该继承样式到其他断点', () => {
      const initialStyles = {
        mobile: { width: '100%', fontSize: '14px', color: '#333' },
      }

      const { result } = renderHook(() =>
        StyleEditorCore.useResponsiveStyles(initialStyles, StyleEditorCore.DEFAULT_BREAKPOINTS)
      )

      act(() => {
        result.current.inheritFromBreakpoint('mobile', 'tablet', ['width', 'fontSize'])
      })

      expect(result.current.styles.tablet.width).toBe('100%')
      expect(result.current.styles.tablet.fontSize).toBe('14px')
      expect(result.current.styles.tablet.color).toBeUndefined() // 没有继承color
    })

    it('应该重置断点样式', () => {
      const initialStyles = {
        mobile: { width: '100%' },
        desktop: { width: '1200px' },
      }

      const { result } = renderHook(() =>
        StyleEditorCore.useResponsiveStyles(initialStyles, StyleEditorCore.DEFAULT_BREAKPOINTS)
      )

      act(() => {
        result.current.resetBreakpointStyles('mobile')
      })

      expect(result.current.styles.mobile).toEqual({})
      expect(result.current.styles.desktop.width).toBe('1200px') // 桌面端不受影响
    })
  })

  describe('样式预设管理', () => {
    const initialPresets = [
      {
        name: '默认按钮',
        styles: { backgroundColor: '#3b82f6', color: '#ffffff', padding: '8px 16px' },
      },
      {
        name: '危险按钮',
        styles: { backgroundColor: '#ef4444', color: '#ffffff', padding: '8px 16px' },
      },
    ]

    it('应该应用预设样式', () => {
      const mockOnUpdate = jest.fn()

      const { result } = renderHook(() =>
        StyleEditorCore.useStylePresets(initialPresets)
      )

      act(() => {
        result.current.applyPreset(initialPresets[0], mockOnUpdate)
      })

      expect(mockOnUpdate).toHaveBeenCalledWith(initialPresets[0].styles)
    })

    it('应该保存自定义预设', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStylePresets(initialPresets)
      )

      const customStyles = { backgroundColor: '#10b981', borderRadius: '8px' }

      act(() => {
        const newPreset = result.current.savePreset('自定义按钮', customStyles, '绿色圆角按钮')
        expect(newPreset.name).toBe('自定义按钮')
        expect(newPreset.description).toBe('绿色圆角按钮')
        expect(newPreset.styles).toEqual(customStyles)
        expect(newPreset.createdAt).toBeDefined()
      })

      const allPresets = result.current.getAllPresets()
      expect(allPresets).toHaveLength(3)
      expect(allPresets[2].name).toBe('自定义按钮')
    })

    it('应该删除预设', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStylePresets(initialPresets)
      )

      expect(result.current.getAllPresets()).toHaveLength(2)

      act(() => {
        result.current.deletePreset('默认按钮')
      })

      const remainingPresets = result.current.getAllPresets()
      expect(remainingPresets).toHaveLength(1)
      expect(remainingPresets[0].name).toBe('危险按钮')
    })

    it('应该根据名称获取预设', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStylePresets(initialPresets)
      )

      const preset = result.current.getPresetByName('危险按钮')
      expect(preset?.styles.backgroundColor).toBe('#ef4444')

      const nonExistentPreset = result.current.getPresetByName('不存在的预设')
      expect(nonExistentPreset).toBeUndefined()
    })
  })

  describe('样式历史管理', () => {
    it('应该记录样式变更历史', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleHistory(mockStyles)
      )

      expect(result.current.history).toHaveLength(1)
      expect(result.current.historyIndex).toBe(0)
      expect(result.current.current).toEqual(mockStyles)
    })

    it('应该添加历史记录', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleHistory(mockStyles)
      )

      const newStyles = { ...mockStyles, backgroundColor: '#ef4444' }

      act(() => {
        result.current.addToHistory(newStyles)
      })

      expect(result.current.history).toHaveLength(2)
      expect(result.current.historyIndex).toBe(1)
      expect(result.current.current).toEqual(newStyles)
    })

    it('应该支持撤销操作', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleHistory(mockStyles)
      )

      const newStyles = { ...mockStyles, backgroundColor: '#ef4444' }

      act(() => {
        result.current.addToHistory(newStyles)
      })

      expect(result.current.canUndo).toBe(true)

      act(() => {
        const undoneStyles = result.current.undo()
        expect(undoneStyles).toEqual(mockStyles)
      })

      expect(result.current.historyIndex).toBe(0)
      expect(result.current.current).toEqual(mockStyles)
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleHistory(mockStyles)
      )

      const newStyles = { ...mockStyles, backgroundColor: '#ef4444' }

      act(() => {
        result.current.addToHistory(newStyles)
      })

      expect(result.current.canUndo).toBe(true)

      act(() => {
        result.current.undo()
      })

      expect(result.current.canRedo).toBe(true)

      act(() => {
        const redoneStyles = result.current.redo()
        expect(redoneStyles).toEqual(newStyles)
      })

      expect(result.current.historyIndex).toBe(1)
      expect(result.current.current).toEqual(newStyles)
    })

    it('应该限制历史记录数量', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleHistory({})
      )

      // 添加超过限制数量的历史记录
      for (let i = 0; i < 60; i++) {
        act(() => {
          result.current.addToHistory({ version: i })
        })
      }

      expect(result.current.history.length).toBeLessThanOrEqual(50)
    })

    it('应该清空历史记录', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleHistory(mockStyles)
      )

      act(() => {
        result.current.addToHistory({ ...mockStyles, backgroundColor: '#ef4444' })
      })

      expect(result.current.history).toHaveLength(2)

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.history).toHaveLength(1)
      expect(result.current.historyIndex).toBe(0)
    })
  })

  describe('样式代码生成', () => {
    it('应该生成CSS代码', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleCodeGeneration()
      )

      const css = result.current.generateCSS(mockStyles, '.my-button')

      expect(css).toContain('.my-button {')
      expect(css).toContain('display: flex;')
      expect(css).toContain('width: 100%;')
      expect(css).toContain('background-color: #3b82f6;')
      expect(css).toContain('color: #ffffff;')
      expect(css).toContain('}')
    })

    it('应该生成内联样式', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleCodeGeneration()
      )

      const inlineStyles = result.current.generateInlineStyles(mockStyles)

      expect(inlineStyles.display).toBe('flex')
      expect(inlineStyles.width).toBe('100%')
      expect(inlineStyles.backgroundColor).toBe('#3b82f6')
      expect(inlineStyles.color).toBe('#ffffff')
    })

    it('应该生成Tailwind类名', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleCodeGeneration()
      )

      const classes = result.current.generateTailwindClasses(mockStyles)

      expect(classes).toContain('bg-[#3b82f6]')
      expect(classes).toContain('text-[#ffffff]')
      expect(classes).toContain('text-[16px]')
    })

    it('应该处理空样式', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleCodeGeneration()
      )

      const css = result.current.generateCSS({})
      expect(css).toBe('')

      const inlineStyles = result.current.generateInlineStyles({})
      expect(inlineStyles).toEqual({})

      const classes = result.current.generateTailwindClasses({})
      expect(classes).toHaveLength(0)
    })
  })

  describe('样式导入导出', () => {
    it('应该导出为JSON格式', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleImportExport()
      )

      const json = result.current.exportToJSON(mockStyles, {
        componentType: 'Button',
        variant: 'primary',
      })

      const parsed = JSON.parse(json)
      expect(parsed.version).toBe('1.0.0')
      expect(parsed.styles).toEqual(mockStyles)
      expect(parsed.metadata.totalStyles).toBe(6)
      expect(parsed.metadata.componentType).toBe('Button')
      expect(parsed.timestamp).toBeDefined()
    })

    it('应该从JSON导入', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleImportExport()
      )

      const importData = {
        version: '1.0.0',
        styles: { backgroundColor: '#ef4444', fontSize: '18px' },
        metadata: { componentType: 'Button' },
      }

      const importedStyles = result.current.importFromJSON(JSON.stringify(importData))

      expect(importedStyles).toEqual(importData.styles)
    })

    it('应该导出为CSS格式', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleImportExport()
      )

      const css = result.current.exportToCSS(mockStyles, '.custom-button')

      expect(css).toContain('/* 导出的样式配置 */')
      expect(css).toContain('.custom-button {')
      expect(css).toContain('display: flex;')
      expect(css).toContain('background-color: #3b82f6;')
    })

    it('应该处理无效的导入数据', () => {
      const { result } = renderHook(() =>
        StyleEditorCore.useStyleImportExport()
      )

      expect(() => {
        result.current.importFromJSON('invalid json')
      }).toThrow('无效的JSON格式')

      expect(() => {
        result.current.importFromJSON('{}')
      }).toThrow('导入数据中缺少styles字段')

      expect(() => {
        result.current.importFromJSON('{ "metadata": {} }')
      }).toThrow('导入数据中缺少styles字段')
    })
  })
})