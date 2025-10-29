# 设计系统

基于 shadcn/ui 的完整设计系统集成，支持明亮、暗黑、高对比度三种主题模式。

## 功能特性

- ✅ **主题管理** - 支持明亮、暗黑、高对比度三种主题
- ✅ **设计令牌** - 统一的颜色、间距、字体等设计规范
- ✅ **组件变体** - 基于 CVA 的组件样式变体系统
- ✅ **响应式设计** - 内置断点系统和响应式工具
- ✅ **TypeScript 支持** - 完整的类型定义和类型安全
- ✅ **主题切换** - 实时主题切换和本地存储
- ✅ **高对比度支持** - 符合可访问性标准

## 快速开始

### 安装依赖

```bash
# class-variance-authority 已在项目中配置
npm install class-variance-authority
```

### 基础使用

```typescript
import {
  buttonVariants,
  cardVariants,
  getVariantClasses,
  applyTheme,
  type ButtonVariants,
} from '@/lib/lowcode/design-system'

// 使用按钮变体
const buttonClass = buttonVariants({
  variant: 'primary',
  size: 'lg',
})

// 通用变体获取
const cardClass = getVariantClasses('card', {
  variant: 'elevated',
  size: 'md',
})

// 主题切换
applyTheme('dark') // 切换到暗黑主题
```

## 主题系统

### 支持的主题

- `light` - 明亮主题（默认）
- `dark` - 暗黑主题
- `high-contrast` - 高对比度主题（可访问性）

### 主题切换

```typescript
import { createThemeUtils } from '@/lib/lowcode/design-system'

const { initTheme, toggleTheme, getSavedTheme } = createThemeUtils()

// 初始化主题
initTheme('dark')

// 切换主题
const newTheme = toggleTheme()

// 获取保存的主题
const currentTheme = getSavedTheme()
```

### 主题定制

```typescript
import { getTheme, type Theme } from '@/lib/lowcode/design-system'

const theme = getTheme('light')

// 访问主题颜色
console.log(theme.colors.primary)
console.log(theme.spacing.md)
console.log(theme.typography.fontSize.base)
```

## 设计令牌

### 颜色令牌

```typescript
import { getTokenByName, generateTokenCSS } from '@/lib/lowcode/design-system'

// 获取特定令牌
const primaryColor = getTokenByName('primary')

// 生成CSS变量
const cssVariables = generateTokenCSS(primaryColor)
```

### 响应式断点

```typescript
import { BREAKPOINTS, getCurrentBreakpoint } from '@/lib/lowcode/design-system'

// 断点配置
console.log(BREAKPOINTS.mobile) // { min: 0, max: 767 }

// 获取当前断点
const current = getCurrentBreakpoint(1024) // 'desktop'
```

## 组件变体

### 按钮变体

```typescript
import { buttonVariants, type ButtonVariants } from '@/lib/lowcode/design-system'

interface CustomButtonProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  state?: 'default' | 'loading' | 'disabled'
}

export const CustomButton = ({ variant, size, state, ...props }: CustomButtonProps) => {
  return (
    <button
      className={buttonVariants({ variant, size, state })}
      {...props}
    />
  )
}
```

### 卡片变体

```typescript
import { cardVariants } from '@/lib/lowcode/design-system'

const cardClass = cardVariants({
  variant: 'elevated', // default | elevated | outlined | ghost | filled
  size: 'lg', // sm | md | lg | xl | 2xl
  state: 'hover', // default | hover | interactive | disabled
})
```

### 输入框变体

```typescript
import { inputVariants } from '@/lib/lowcode/design-system'

const inputClass = inputVariants({
  variant: 'success', // default | destructive | success | warning | outline
  size: 'lg', // sm | md | lg | xl
  state: 'error', // default | error | disabled | readonly
})
```

## 响应式工具

### 响应式类名生成

```typescript
import { generateResponsiveClass } from '@/lib/lowcode/design-system'

const responsiveClasses = generateResponsiveClass('w-full', {
  mobile: 'px-2',
  tablet: 'px-4',
  desktop: 'px-8',
})
// 结果: "w-full px-2 sm:px-4 lg:px-8"
```

### 响应式变体

```typescript
import { responsiveVariant } from '@/lib/lowcode/design-system'

const variantMap = {
  default: 'text-base',
  sm: 'text-sm',
  lg: 'text-lg',
}

const responsiveText = responsiveVariant(variantMap, {
  sm: 'sm',
  lg: 'lg',
})
// 结果: "text-base sm:text-sm lg:text-lg"
```

## 在组件中使用

### 主题感知组件

```typescript
'use client'

import { useTheme } from 'next-themes'
import { createThemeUtils } from '@/lib/lowcode/design-system'

export const ThemedComponent = () => {
  const { theme } = useTheme()
  const { initTheme } = createThemeUtils()

  useEffect(() => {
    if (theme) {
      initTheme(theme as any)
    }
  }, [theme])

  return (
    <div className="bg-background text-foreground border rounded-lg p-4">
      主题感知组件
    </div>
  )
}
```

### 低代码组件集成

```typescript
import {
  buttonVariants,
  containerVariants,
  getVariantClasses
} from '@/lib/lowcode/design-system'

// 在低代码组件中使用
export const LowCodeButton = ({
  variant = 'default',
  size = 'md',
  children
}) => {
  return (
    <button className={getVariantClasses('button', { variant, size })}>
      {children}
    </button>
  )
}
```

## CSS 变量

设计系统自动生成以下 CSS 变量：

### 基础颜色变量

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... 更多颜色变量 */
}
```

### 主题特定变量

```css
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... 暗黑主题变量 */
}

.high-contrast {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  /* ... 高对比度主题变量 */
}
```

## 调试工具

### 开发环境调试

```typescript
import { debugUtils } from '@/lib/lowcode/design-system'

// 打印所有设计令牌
debugUtils.printAllTokens()

// 打印主题信息
debugUtils.printThemeInfo('dark')

// 生成CSS变量调试信息
const css = debugUtils.generateDebugCSS()
```

## 文件结构

```
lib/lowcode/design-system/
├── index.ts          # 统一导出
├── theme.ts          # 主题配置
├── tokens.ts         # 设计令牌
├── variants.ts       # 组件变体
├── examples.ts       # 使用示例
└── README.md         # 文档
```

## 最佳实践

### 1. 主题使用

- 优先使用语义化颜色变量（`primary`, `destructive` 等）
- 避免硬编码颜色值
- 考虑高对比度模式的可访问性

### 2. 组件变体

- 使用 `getVariantClasses` 获取变体类名
- 为组件提供合理的默认值
- 保持变体命名的一致性

### 3. 响应式设计

- 使用内置的断点系统
- 优先考虑移动端设计
- 使用响应式工具函数

### 4. 性能优化

- 按需导入设计系统模块
- 避免重复计算类名
- 合理使用 CSS 变量

## 贡献指南

1. 新增组件变体时，请更新 `variants.ts`
2. 新增设计令牌时，请更新 `tokens.ts`
3. 更新主题配置时，请同步更新 CSS 变量
4. 添加新示例时，请更新 `examples.ts`

## 版本信息

- **版本**: 1.0.0
- **基于**: shadcn/ui + Tailwind CSS
- **兼容性**: Next.js 15 + React 19
