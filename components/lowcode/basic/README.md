# 基础组件库 (Basic Component Library)

## 概述

这是全栈低代码开发平台的基础组件库，基于 Next.js 15 + React 19 + TypeScript + shadcn/ui + Tailwind CSS 构建。

## 组件列表

### 已完成的组件

#### 1. Button (按钮组件)

- **位置**: `/components/lowcode/basic/Button/`
- **文件**: `Button.tsx`, `definition.ts`, `Preview.tsx`, `Icon.tsx`
- **功能**: 支持多种样式变体、尺寸、加载状态、图标位置等

#### 2. Input (输入框组件)

- **位置**: `/components/lowcode/basic/Input/`
- **文件**: `Input.tsx`
- **功能**: 支持多种输入类型、验证、字符计数、错误状态等

#### 3. Textarea (文本域组件)

- **位置**: `/components/lowcode/basic/Textarea/`
- **文件**: `definition.ts`, `Textarea.tsx`, `Preview.tsx`, `Icon.tsx`
- **功能**: 多行文本输入、字符限制、自动调整大小、多种调整模式等

#### 4. Select (选择器组件)

- **位置**: `/components/lowcode/basic/Select/`
- **文件**: `definition.ts`, `Select.tsx`, `Preview.tsx`, `Icon.tsx`
- **功能**: 单选/多选、分组选项、搜索、验证等

#### 5. Checkbox (复选框组件)

- **位置**: `/components/lowcode/basic/Checkbox/`
- **文件**: `definition.ts`, `Checkbox.tsx`
- **功能**: 选中/未选中/不确定状态、必填验证、错误提示等

## 组件架构

### 每个组件的标准结构

```
ComponentName/
├── definition.ts    # 组件定义文件（属性配置、验证规则、示例等）
├── ComponentName.tsx # 主要组件实现
├── Preview.tsx      # 预览组件（支持多种状态和变体的预览）
└── Icon.tsx         # 图标组件（多种样式和状态的图标）
```

### 核心特性

1. **TypeScript 严格类型支持**: 所有组件都有完整的类型定义
2. **shadcn/ui 基础**: 基于成熟的 shadcn/ui 组件库构建
3. **Tailwind CSS 样式**: 使用 Tailwind CSS 进行样式管理
4. **完整的属性配置**: 每个组件都有详细的属性定义和验证规则
5. **丰富的预览模式**: 支持状态预览、变体预览、交互预览等
6. **错误处理**: 完善的错误状态显示和验证机制
7. **无障碍支持**: 遵循 ARIA 标准，提供良好的无障碍体验

### 组件属性标准

每个组件都支持以下标准属性：

- **基础属性**: label、placeholder、value、disabled、required 等
- **状态属性**: error、helper、loading 等
- **样式属性**: className、id、style 等
- **事件处理**: onChange、onFocus、onBlur 等
- **高级属性**: 验证规则、自定义配置等

## 预览组件功能

每个组件的 Preview 组件都支持：

- **变体预览**: 展示组件的不同样式变体
- **状态预览**: 展示组件的不同状态（默认、禁用、错误等）
- **尺寸预览**: 展示组件的不同尺寸
- **交互预览**: 支持实时交互的预览模式

## 图标组件功能

每个组件的 Icon 组件都提供：

- **多种样式**: default、filled、outlined、dashed 等
- **动画效果**: 支持悬停、点击等动画效果
- **状态指示**: 不同状态的图标样式
- **尺寸适配**: 支持多种尺寸规格

## 使用方式

```typescript
// 导入组件
import { Button } from '@/components/lowcode/basic/Button'
import { Input } from '@/components/lowcode/basic/Input'
import { Textarea } from '@/components/lowcode/basic/Textarea'
import { Select } from '@/components/lowcode/basic/Select'
import { Checkbox } from '@/components/lowcode/basic/Checkbox'

// 使用组件
export default function MyComponent() {
  return (
    <div className="space-y-4">
      <Input
        label="用户名"
        placeholder="请输入用户名"
        required
        onChange={(value) => console.log(value)}
      />

      <Textarea
        label="描述"
        placeholder="请输入描述..."
        rows={4}
        maxlength={500}
      />

      <Select
        label="国家"
        options={[
          { value: 'cn', label: '中国' },
          { value: 'us', label: '美国' }
        ]}
      />

      <Checkbox
        label="同意条款"
        required
        onChange={(checked) => console.log(checked)}
      />
    </div>
  )
}
```

## 开发规范

1. **命名规范**: 组件名使用 PascalCase，文件名与组件名保持一致
2. **类型定义**: 每个组件都有完整的 TypeScript 接口定义
3. **属性验证**: 使用 definition.ts 定义属性验证规则
4. **错误处理**: 统一的错误状态显示和处理机制
5. **文档注释**: 每个文件都有详细的文档注释
6. **代码风格**: 遵循项目的 ESLint 和 Prettier 配置

## 后续计划

### 待完成的组件

1. **Radio (单选框组件)**: 需要创建完整的文件集
2. **Switch (开关组件)**: 计划添加的组件
3. **Slider (滑块组件)**: 计划添加的组件
4. **DatePicker (日期选择器)**: 计划添加的组件

### 功能增强

1. **主题系统**: 支持多主题切换
2. **国际化**: 支持多语言
3. **动画库**: 丰富的过渡动画效果
4. **表单集成**: 与表单库的深度集成
5. **测试覆盖**: 完整的单元测试和集成测试

---

## 技术栈

- **框架**: Next.js 15 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: shadcn/ui
- **图标**: Lucide React (SVG)
- **构建**: Turbopack
- **包管理**: pnpm

---

_最后更新: 2025-10-29_
