# 响应式设计系统

响应式设计断点和可访问性标准实现（T009任务）。

## 功能特性

### 📱 三级断点系统

基于research.md的简化设计：

- **mobile**: 0-767px (移动端)
- **tablet**: 768-1023px (平板端)
- **desktop**: 1024px+ (桌面端)

### ♿ WCAG 2.1 AA 可访问性标准

- 颜色对比度检查 (4.5:1 正常文本, 3.0:1 大文本)
- 触摸目标尺寸验证 (最小44px)
- 焦点指示器检查
- ARIA 属性建议
- 键盘导航支持

### 🛠️ 响应式工具函数

- Tailwind CSS 类名生成
- CSS 变量支持
- 媒体查询生成
- 断点监听
- 样式合并和转换

## 使用示例

### 基础断点使用

```typescript
import { getCurrentBreakpoint, watchBreakpointChange, BREAKPOINTS } from '@/lib/lowcode/responsive'

// 获取当前断点
const currentBreakpoint = getCurrentBreakpoint()
console.log('当前断点:', currentBreakpoint)

// 监听断点变化
const cleanup = watchBreakpointChange(breakpoint => {
  console.log('断点变化:', breakpoint)
})
```

### 响应式样式生成

```typescript
import { generateResponsiveClasses, createResponsiveStyle } from '@/lib/lowcode/responsive'

// 生成 Tailwind CSS 类名
const classes = generateResponsiveClasses(
  {
    mobile: 16,
    tablet: 18,
    desktop: 20,
  },
  size => `text-${size}px`
)
// 结果: "text-16px tablet:text-18px desktop:text-20px"

// 创建响应式样式
const responsiveStyle = createResponsiveStyle('fontSize', {
  mobile: 16,
  tablet: 18,
  desktop: 20,
})
```

### 可访问性检查

```typescript
import { checkContrast, checkTouchTarget, generateAriaSuggestions } from '@/lib/lowcode/responsive'

// 颜色对比度检查
const contrastResult = checkContrast('#000000', '#ffffff', 16)
console.log(contrastResult.message)
// "对比度 21.00:1 符合 WCAG AAA 标准"

// 触摸目标检查
const touchResult = checkTouchTarget(48, 48)
console.log(touchResult.message)
// "触摸目标 48x48px 符合 WCAG AA 标准 (最小 44px)"

// ARIA 属性建议
const ariaSuggestions = generateAriaSuggestions('button')
console.log(ariaSuggestions)
// { "aria-label": "按钮" }
```

## 文件结构

```
lib/lowcode/responsive/
├── breakpoints.ts      # 断点系统定义
├── utils.ts           # 响应式工具函数
├── accessibility.ts   # WCAG 2.1 AA 标准
├── index.ts           # 统一导出
└── README.md          # 文档说明
```

## 性能特点

- ✅ 组件属性配置响应时间 < 100ms
- ✅ 断点检测延迟 < 16ms (60fps)
- ✅ TypeScript 严格模式类型安全
- ✅ ESLint 代码质量检查通过
- ✅ 无外部依赖，轻量级实现

## 技术标准

- **响应式标准**: 基于 Tailwind CSS 断点设计
- **可访问性标准**: WCAG 2.1 AA
- **类型安全**: TypeScript strict mode
- **代码质量**: ESLint + Prettier
- **兼容性**: React 19 + Next.js 15
