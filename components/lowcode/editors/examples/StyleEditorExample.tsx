/**
 * 样式编辑器示例组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 * 用途: 展示样式编辑器和实时预览的完整功能
 */

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StyleEditor } from '../StyleEditor'
import { StylePreviewSync } from '../StylePreviewSync'
import { FieldDefinition } from '@/lib/lowcode/types/editor'
import { cn } from '@/lib/utils'
import {
  Palette,
  Eye,
  Settings,
  Code,
  Layout,
  Type
} from 'lucide-react'

// 本地接口定义
interface ComponentStyles {
  [key: string]: unknown
}

// 示例组件定义
const exampleComponent = {
  id: 'example-button',
  name: '示例按钮',
  category: 'basic',
  defaultStyles: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  }
}

// 增强的样式定义
const enhancedStyleDefinitions: FieldDefinition[] = [
  // 布局属性
  {
    name: 'display',
    type: 'select',
    label: '显示方式',
    description: '元素的显示类型',
    required: false,
    config: {
      options: [
        { value: 'inline-block', label: '行内块' },
        { value: 'block', label: '块级' },
        { value: 'flex', label: '弹性布局' },
        { value: 'inline-flex', label: '行内弹性' },
      ],
    },
  },
  {
    name: 'width',
    type: 'size',
    label: '宽度',
    description: '元素宽度',
    required: false,
  },
  {
    name: 'height',
    type: 'size',
    label: '高度',
    description: '元素高度',
    required: false,
  },
  {
    name: 'margin',
    type: 'spacing',
    label: '外边距',
    description: '元素外部的间距',
    required: false,
  },

  // 文字属性
  {
    name: 'fontSize',
    type: 'size',
    label: '字号',
    description: '文字大小',
    required: false,
  },
  {
    name: 'fontWeight',
    type: 'select',
    label: '字重',
    description: '文字粗细',
    required: false,
    config: {
      options: [
        { value: 'normal', label: '正常' },
        { value: '500', label: '中等' },
        { value: '600', label: '半粗' },
        { value: 'bold', label: '粗体' },
      ],
    },
  },
  {
    name: 'fontFamily',
    type: 'select',
    label: '字体',
    description: '文字字体',
    required: false,
    config: {
      options: [
        { value: 'system-ui', label: '系统默认' },
        { value: 'Arial', label: 'Arial' },
        { value: 'Georgia', label: 'Georgia' },
      ],
    },
  },
  {
    name: 'textAlign',
    type: 'select',
    label: '文字对齐',
    description: '文字对齐方式',
    required: false,
    config: {
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中' },
        { value: 'right', label: '右对齐' },
      ],
    },
  },
  {
    name: 'lineHeight',
    type: 'number',
    label: '行高',
    description: '文字行高',
    required: false,
    config: {
      min: 1,
      max: 3,
      step: 0.1,
    },
  },

  // 外观属性
  {
    name: 'backgroundColor',
    type: 'color',
    label: '背景色',
    description: '元素的背景颜色',
    required: false,
  },
  {
    name: 'color',
    type: 'color',
    label: '文字颜色',
    description: '文字的颜色',
    required: false,
  },
  {
    name: 'border',
    type: 'border',
    label: '边框',
    description: '元素的边框样式',
    required: false,
  },
  {
    name: 'borderRadius',
    type: 'size',
    label: '圆角',
    description: '元素的圆角大小',
    required: false,
  },
  {
    name: 'padding',
    type: 'spacing',
    label: '内边距',
    description: '元素内部的间距',
    required: false,
  },

  // 效果属性
  {
    name: 'boxShadow',
    type: 'shadow',
    label: '阴影',
    description: '元素的阴影效果',
    required: false,
  },
  {
    name: 'opacity',
    type: 'number',
    label: '透明度',
    description: '元素的透明度 (0-1)',
    required: false,
    config: {
      min: 0,
      max: 1,
      step: 0.1,
    },
  },
  {
    name: 'transition',
    type: 'transition',
    label: '过渡动画',
    description: '样式变化的过渡效果',
    required: false,
  },
  {
    name: 'transform',
    type: 'text',
    label: '变换',
    description: '元素的变换效果',
    placeholder: '例如: scale(1.05) rotate(5deg)',
    required: false,
  },

  // 交互状态
  {
    name: 'cursor',
    type: 'select',
    label: '鼠标样式',
    description: '鼠标悬停时的样式',
    required: false,
    config: {
      options: [
        { value: 'pointer', label: '手型' },
        { value: 'default', label: '默认' },
        { value: 'not-allowed', label: '禁止' },
        { value: 'help', label: '帮助' },
      ],
    },
  },
  {
    name: 'userSelect',
    type: 'select',
    label: '文本选择',
    description: '是否允许选择文本',
    required: false,
    config: {
      options: [
        { value: 'none', label: '禁止选择' },
        { value: 'text', label: '允许选择' },
        { value: 'auto', label: '自动' },
      ],
    },
  },
]

interface StyleEditorExampleProps {
  className?: string
}

export const StyleEditorExample: React.FC<StyleEditorExampleProps> = ({ className }) => {
  const [styles, setStyles] = useState<ComponentStyles>(exampleComponent.defaultStyles)
  const [savedStyles, setSavedStyles] = useState<ComponentStyles>(exampleComponent.defaultStyles)
  const [activeTab, setActiveTab] = useState('editor')

  // 处理样式变化
  const handleStyleChange = useCallback((newStyles: ComponentStyles) => {
    setStyles(newStyles)
    console.log('样式变化:', newStyles)
  }, [])

  // 处理样式保存
  const handleStyleSave = useCallback((newStyles: ComponentStyles) => {
    setSavedStyles(newStyles)
    console.log('样式保存:', newStyles)
  }, [])

  // 处理样式重置
  const handleStyleReset = useCallback(() => {
    setStyles(exampleComponent.defaultStyles)
    console.log('样式重置')
  }, [])

  // 生成CSS代码
  const generateCSSCode = useCallback(() => {
    const cssRules: string[] = []

    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // 转换驼峰命名为短横线命名
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
        cssRules.push(`  ${cssProperty}: ${value};`)
      }
    })

    return `.example-component {\n${cssRules.join('\n')}\n}`
  }, [styles])

  // 渲染独立编辑器
  const renderStandaloneEditor = () => (
    <StyleEditor
      component={{
        ...exampleComponent,
        styleDefinitions: enhancedStyleDefinitions
      }}
      value={styles}
      config={{
        showPreview: true,
        showValidation: true,
        showReset: true,
        groups: ['layout', 'typography', 'spacing', 'visual', 'effects'],
        collapsible: true,
      }}
      previewConfig={{
        enabled: true,
        width: 300,
        height: 200,
        showBorder: true,
        backgroundColor: '#f8fafc',
      }}
      onChange={handleStyleChange}
      onPreviewStyle={handleStyleChange}
      onResetStyles={handleStyleReset}
      onSaveStyles={handleStyleSave}
      readonly={false}
      disabled={false}
      loading={false}
    />
  )

  // 渲染同步编辑器
  const renderSyncEditor = () => (
    <StylePreviewSync
      component={{
        ...exampleComponent,
        styleDefinitions: enhancedStyleDefinitions,
        defaultStyles: exampleComponent.defaultStyles
      }}
      initialStyles={styles}
      editorConfig={{
        showPreview: false, // 同步模式下不需要内置预览
        showValidation: true,
        showReset: true,
        groups: ['layout', 'typography', 'spacing', 'visual', 'effects'],
        collapsible: true,
      }}
      previewConfig={{
        showDeviceSelector: true,
        showStyleInfo: true,
        showReset: false,
        defaultDevice: 'desktop',
        backgroundColor: '#f8fafc',
        showGrid: false,
        scale: 1,
      }}
      layout={{
        direction: 'horizontal',
        sizes: [50, 50],
        resizable: true,
        showDivider: true,
      }}
      livePreview={{
        enabled: true,
        debounceMs: 300,
        autoSave: false,
        autoSaveInterval: 5000,
      }}
      onStyleChange={handleStyleChange}
      onStyleSave={handleStyleSave}
      onStyleReset={handleStyleReset}
      loading={false}
      disabled={false}
      readonly={false}
    />
  )

  // 渲染CSS代码
  const renderCSSCode = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          生成的CSS代码
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
          {generateCSSCode()}
        </pre>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(generateCSSCode())
              console.log('CSS代码已复制到剪贴板')
            }}
          >
            复制代码
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const blob = new Blob([generateCSSCode()], { type: 'text/css' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'styles.css'
              a.click()
              URL.revokeObjectURL(url)
              console.log('CSS文件已下载')
            }}
          >
            下载CSS
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={cn('style-editor-example p-6', className)}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">样式编辑器示例</h1>
            <p className="text-muted-foreground">
              展示样式编辑器和实时预览功能的完整使用方法
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {exampleComponent.name}
            </Badge>
            <Badge variant="secondary">
              {Object.keys(styles).length} 个样式属性
            </Badge>
          </div>
        </div>

        {/* 主要内容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[800px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              独立编辑器
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              同步预览
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              CSS代码
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="h-[calc(100%-3rem)] mt-4">
            {renderStandaloneEditor()}
          </TabsContent>

          <TabsContent value="sync" className="h-[calc(100%-3rem)] mt-4">
            {renderSyncEditor()}
          </TabsContent>

          <TabsContent value="code" className="h-[calc(100%-3rem)] mt-4">
            {renderCSSCode()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default StyleEditorExample