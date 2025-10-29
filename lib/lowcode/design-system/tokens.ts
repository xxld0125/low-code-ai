/**
 * 设计令牌(Design Tokens)系统
 * 提供统一的设计规范和变量管理
 * 基于shadcn/ui设计系统扩展
 */

export interface DesignToken {
  name: string
  value: string | number | string[]
  type: TokenType
  description?: string
  category: TokenCategory
}

export type TokenType =
  | 'color'
  | 'spacing'
  | 'typography'
  | 'shadow'
  | 'borderRadius'
  | 'breakpoint'
  | 'sizing'
  | 'zIndex'
  | 'transition'

export type TokenCategory =
  | 'semantic' // 语义化令牌
  | 'primitive' // 基础令牌
  | 'component' // 组件令牌
  | 'global' // 全局令牌

/**
 * 基础颜色令牌 - 原始颜色
 */
export const primitiveColorTokens: DesignToken[] = [
  // 中性色系
  { name: 'white', value: '#ffffff', type: 'color', category: 'primitive', description: '纯白色' },
  { name: 'black', value: '#000000', type: 'color', category: 'primitive', description: '纯黑色' },
  {
    name: 'gray-50',
    value: '#f9fafb',
    type: 'color',
    category: 'primitive',
    description: '最浅灰色',
  },
  { name: 'gray-100', value: '#f3f4f6', type: 'color', category: 'primitive' },
  { name: 'gray-200', value: '#e5e7eb', type: 'color', category: 'primitive' },
  { name: 'gray-300', value: '#d1d5db', type: 'color', category: 'primitive' },
  { name: 'gray-400', value: '#9ca3af', type: 'color', category: 'primitive' },
  { name: 'gray-500', value: '#6b7280', type: 'color', category: 'primitive' },
  { name: 'gray-600', value: '#4b5563', type: 'color', category: 'primitive' },
  { name: 'gray-700', value: '#374151', type: 'color', category: 'primitive' },
  { name: 'gray-800', value: '#1f2937', type: 'color', category: 'primitive' },
  {
    name: 'gray-900',
    value: '#111827',
    type: 'color',
    category: 'primitive',
    description: '最深灰色',
  },

  // 主色系 - 蓝色
  { name: 'blue-50', value: '#eff6ff', type: 'color', category: 'primitive' },
  { name: 'blue-100', value: '#dbeafe', type: 'color', category: 'primitive' },
  { name: 'blue-200', value: '#bfdbfe', type: 'color', category: 'primitive' },
  { name: 'blue-300', value: '#93c5fd', type: 'color', category: 'primitive' },
  { name: 'blue-400', value: '#60a5fa', type: 'color', category: 'primitive' },
  {
    name: 'blue-500',
    value: '#3b82f6',
    type: 'color',
    category: 'primitive',
    description: '主色调',
  },
  { name: 'blue-600', value: '#2563eb', type: 'color', category: 'primitive' },
  { name: 'blue-700', value: '#1d4ed8', type: 'color', category: 'primitive' },
  { name: 'blue-800', value: '#1e40af', type: 'color', category: 'primitive' },
  { name: 'blue-900', value: '#1e3a8a', type: 'color', category: 'primitive' },

  // 成功色系 - 绿色
  { name: 'green-50', value: '#f0fdf4', type: 'color', category: 'primitive' },
  { name: 'green-100', value: '#dcfce7', type: 'color', category: 'primitive' },
  { name: 'green-200', value: '#bbf7d0', type: 'color', category: 'primitive' },
  { name: 'green-300', value: '#86efac', type: 'color', category: 'primitive' },
  { name: 'green-400', value: '#4ade80', type: 'color', category: 'primitive' },
  {
    name: 'green-500',
    value: '#22c55e',
    type: 'color',
    category: 'primitive',
    description: '成功色',
  },
  { name: 'green-600', value: '#16a34a', type: 'color', category: 'primitive' },
  { name: 'green-700', value: '#15803d', type: 'color', category: 'primitive' },
  { name: 'green-800', value: '#166534', type: 'color', category: 'primitive' },
  { name: 'green-900', value: '#14532d', type: 'color', category: 'primitive' },

  // 警告色系 - 黄色
  { name: 'yellow-50', value: '#fefce8', type: 'color', category: 'primitive' },
  { name: 'yellow-100', value: '#fef3c7', type: 'color', category: 'primitive' },
  { name: 'yellow-200', value: '#fde68a', type: 'color', category: 'primitive' },
  { name: 'yellow-300', value: '#fcd34d', type: 'color', category: 'primitive' },
  { name: 'yellow-400', value: '#fbbf24', type: 'color', category: 'primitive' },
  {
    name: 'yellow-500',
    value: '#f59e0b',
    type: 'color',
    category: 'primitive',
    description: '警告色',
  },
  { name: 'yellow-600', value: '#d97706', type: 'color', category: 'primitive' },
  { name: 'yellow-700', value: '#b45309', type: 'color', category: 'primitive' },
  { name: 'yellow-800', value: '#92400e', type: 'color', category: 'primitive' },
  { name: 'yellow-900', value: '#78350f', type: 'color', category: 'primitive' },

  // 错误色系 - 红色
  { name: 'red-50', value: '#fef2f2', type: 'color', category: 'primitive' },
  { name: 'red-100', value: '#fee2e2', type: 'color', category: 'primitive' },
  { name: 'red-200', value: '#fecaca', type: 'color', category: 'primitive' },
  { name: 'red-300', value: '#fca5a5', type: 'color', category: 'primitive' },
  { name: 'red-400', value: '#f87171', type: 'color', category: 'primitive' },
  {
    name: 'red-500',
    value: '#ef4444',
    type: 'color',
    category: 'primitive',
    description: '错误色',
  },
  { name: 'red-600', value: '#dc2626', type: 'color', category: 'primitive' },
  { name: 'red-700', value: '#b91c1c', type: 'color', category: 'primitive' },
  { name: 'red-800', value: '#991b1b', type: 'color', category: 'primitive' },
  { name: 'red-900', value: '#7f1d1d', type: 'color', category: 'primitive' },

  // 信息色系 - 青色
  { name: 'cyan-50', value: '#ecfeff', type: 'color', category: 'primitive' },
  { name: 'cyan-100', value: '#cffafe', type: 'color', category: 'primitive' },
  { name: 'cyan-200', value: '#a5f3fc', type: 'color', category: 'primitive' },
  { name: 'cyan-300', value: '#67e8f9', type: 'color', category: 'primitive' },
  { name: 'cyan-400', value: '#22d3ee', type: 'color', category: 'primitive' },
  {
    name: 'cyan-500',
    value: '#06b6d4',
    type: 'color',
    category: 'primitive',
    description: '信息色',
  },
  { name: 'cyan-600', value: '#0891b2', type: 'color', category: 'primitive' },
  { name: 'cyan-700', value: '#0e7490', type: 'color', category: 'primitive' },
  { name: 'cyan-800', value: '#155e75', type: 'color', category: 'primitive' },
  { name: 'cyan-900', value: '#164e63', type: 'color', category: 'primitive' },
]

/**
 * 语义化颜色令牌
 */
export const semanticColorTokens: DesignToken[] = [
  // 基础色彩
  {
    name: 'background',
    value: 'hsl(var(--background))',
    type: 'color',
    category: 'semantic',
    description: '页面背景色',
  },
  {
    name: 'foreground',
    value: 'hsl(var(--foreground))',
    type: 'color',
    category: 'semantic',
    description: '页面前景色',
  },

  // 卡片和弹出层
  {
    name: 'card',
    value: 'hsl(var(--card))',
    type: 'color',
    category: 'semantic',
    description: '卡片背景色',
  },
  {
    name: 'card-foreground',
    value: 'hsl(var(--card-foreground))',
    type: 'color',
    category: 'semantic',
    description: '卡片前景色',
  },
  {
    name: 'popover',
    value: 'hsl(var(--popover))',
    type: 'color',
    category: 'semantic',
    description: '弹出层背景色',
  },
  {
    name: 'popover-foreground',
    value: 'hsl(var(--popover-foreground))',
    type: 'color',
    category: 'semantic',
    description: '弹出层前景色',
  },

  // 主要色彩
  {
    name: 'primary',
    value: 'hsl(var(--primary))',
    type: 'color',
    category: 'semantic',
    description: '主色调',
  },
  {
    name: 'primary-foreground',
    value: 'hsl(var(--primary-foreground))',
    type: 'color',
    category: 'semantic',
    description: '主色调前景色',
  },

  // 次要色彩
  {
    name: 'secondary',
    value: 'hsl(var(--secondary))',
    type: 'color',
    category: 'semantic',
    description: '次要色调',
  },
  {
    name: 'secondary-foreground',
    value: 'hsl(var(--secondary-foreground))',
    type: 'color',
    category: 'semantic',
    description: '次要色调前景色',
  },

  // 静音色彩
  {
    name: 'muted',
    value: 'hsl(var(--muted))',
    type: 'color',
    category: 'semantic',
    description: '静音色调',
  },
  {
    name: 'muted-foreground',
    value: 'hsl(var(--muted-foreground))',
    type: 'color',
    category: 'semantic',
    description: '静音色调前景色',
  },

  // 强调色彩
  {
    name: 'accent',
    value: 'hsl(var(--accent))',
    type: 'color',
    category: 'semantic',
    description: '强调色调',
  },
  {
    name: 'accent-foreground',
    value: 'hsl(var(--accent-foreground))',
    type: 'color',
    category: 'semantic',
    description: '强调色调前景色',
  },

  // 状态色彩
  {
    name: 'destructive',
    value: 'hsl(var(--destructive))',
    type: 'color',
    category: 'semantic',
    description: '破坏性操作色',
  },
  {
    name: 'destructive-foreground',
    value: 'hsl(var(--destructive-foreground))',
    type: 'color',
    category: 'semantic',
    description: '破坏性操作前景色',
  },

  // 边框和输入
  {
    name: 'border',
    value: 'hsl(var(--border))',
    type: 'color',
    category: 'semantic',
    description: '边框色',
  },
  {
    name: 'input',
    value: 'hsl(var(--input))',
    type: 'color',
    category: 'semantic',
    description: '输入框边框色',
  },
  {
    name: 'ring',
    value: 'hsl(var(--ring))',
    type: 'color',
    category: 'semantic',
    description: '焦点环色',
  },

  // 图表色彩
  {
    name: 'chart-1',
    value: 'hsl(var(--chart-1))',
    type: 'color',
    category: 'semantic',
    description: '图表色1',
  },
  {
    name: 'chart-2',
    value: 'hsl(var(--chart-2))',
    type: 'color',
    category: 'semantic',
    description: '图表色2',
  },
  {
    name: 'chart-3',
    value: 'hsl(var(--chart-3))',
    type: 'color',
    category: 'semantic',
    description: '图表色3',
  },
  {
    name: 'chart-4',
    value: 'hsl(var(--chart-4))',
    type: 'color',
    category: 'semantic',
    description: '图表色4',
  },
  {
    name: 'chart-5',
    value: 'hsl(var(--chart-5))',
    type: 'color',
    category: 'semantic',
    description: '图表色5',
  },
]

/**
 * 间距令牌
 */
export const spacingTokens: DesignToken[] = [
  { name: 'space-0', value: '0', type: 'spacing', category: 'global', description: '无间距' },
  { name: 'space-px', value: '1px', type: 'spacing', category: 'global', description: '1像素间距' },
  {
    name: 'space-0-5',
    value: '0.125rem',
    type: 'spacing',
    category: 'global',
    description: '2px间距',
  },
  {
    name: 'space-1',
    value: '0.25rem',
    type: 'spacing',
    category: 'global',
    description: '4px间距',
  },
  {
    name: 'space-1-5',
    value: '0.375rem',
    type: 'spacing',
    category: 'global',
    description: '6px间距',
  },
  { name: 'space-2', value: '0.5rem', type: 'spacing', category: 'global', description: '8px间距' },
  {
    name: 'space-2-5',
    value: '0.625rem',
    type: 'spacing',
    category: 'global',
    description: '10px间距',
  },
  {
    name: 'space-3',
    value: '0.75rem',
    type: 'spacing',
    category: 'global',
    description: '12px间距',
  },
  {
    name: 'space-3-5',
    value: '0.875rem',
    type: 'spacing',
    category: 'global',
    description: '14px间距',
  },
  { name: 'space-4', value: '1rem', type: 'spacing', category: 'global', description: '16px间距' },
  {
    name: 'space-5',
    value: '1.25rem',
    type: 'spacing',
    category: 'global',
    description: '20px间距',
  },
  {
    name: 'space-6',
    value: '1.5rem',
    type: 'spacing',
    category: 'global',
    description: '24px间距',
  },
  {
    name: 'space-7',
    value: '1.75rem',
    type: 'spacing',
    category: 'global',
    description: '28px间距',
  },
  { name: 'space-8', value: '2rem', type: 'spacing', category: 'global', description: '32px间距' },
  {
    name: 'space-9',
    value: '2.25rem',
    type: 'spacing',
    category: 'global',
    description: '36px间距',
  },
  {
    name: 'space-10',
    value: '2.5rem',
    type: 'spacing',
    category: 'global',
    description: '40px间距',
  },
  {
    name: 'space-11',
    value: '2.75rem',
    type: 'spacing',
    category: 'global',
    description: '44px间距',
  },
  { name: 'space-12', value: '3rem', type: 'spacing', category: 'global', description: '48px间距' },
  {
    name: 'space-14',
    value: '3.5rem',
    type: 'spacing',
    category: 'global',
    description: '56px间距',
  },
  { name: 'space-16', value: '4rem', type: 'spacing', category: 'global', description: '64px间距' },
  { name: 'space-20', value: '5rem', type: 'spacing', category: 'global', description: '80px间距' },
  { name: 'space-24', value: '6rem', type: 'spacing', category: 'global', description: '96px间距' },
  {
    name: 'space-28',
    value: '7rem',
    type: 'spacing',
    category: 'global',
    description: '112px间距',
  },
  {
    name: 'space-32',
    value: '8rem',
    type: 'spacing',
    category: 'global',
    description: '128px间距',
  },
  {
    name: 'space-36',
    value: '9rem',
    type: 'spacing',
    category: 'global',
    description: '144px间距',
  },
  {
    name: 'space-40',
    value: '10rem',
    type: 'spacing',
    category: 'global',
    description: '160px间距',
  },
  {
    name: 'space-44',
    value: '11rem',
    type: 'spacing',
    category: 'global',
    description: '176px间距',
  },
  {
    name: 'space-48',
    value: '12rem',
    type: 'spacing',
    category: 'global',
    description: '192px间距',
  },
  {
    name: 'space-52',
    value: '13rem',
    type: 'spacing',
    category: 'global',
    description: '208px间距',
  },
  {
    name: 'space-56',
    value: '14rem',
    type: 'spacing',
    category: 'global',
    description: '224px间距',
  },
  {
    name: 'space-60',
    value: '15rem',
    type: 'spacing',
    category: 'global',
    description: '240px间距',
  },
  {
    name: 'space-64',
    value: '16rem',
    type: 'spacing',
    category: 'global',
    description: '256px间距',
  },
  {
    name: 'space-72',
    value: '18rem',
    type: 'spacing',
    category: 'global',
    description: '288px间距',
  },
  {
    name: 'space-80',
    value: '20rem',
    type: 'spacing',
    category: 'global',
    description: '320px间距',
  },
  {
    name: 'space-96',
    value: '24rem',
    type: 'spacing',
    category: 'global',
    description: '384px间距',
  },
]

/**
 * 字体大小令牌
 */
export const fontSizeTokens: DesignToken[] = [
  {
    name: 'text-xs',
    value: ['0.75rem', '1rem'],
    type: 'typography',
    category: 'global',
    description: '极小字体',
  },
  {
    name: 'text-sm',
    value: ['0.875rem', '1.25rem'],
    type: 'typography',
    category: 'global',
    description: '小字体',
  },
  {
    name: 'text-base',
    value: ['1rem', '1.5rem'],
    type: 'typography',
    category: 'global',
    description: '基础字体',
  },
  {
    name: 'text-lg',
    value: ['1.125rem', '1.75rem'],
    type: 'typography',
    category: 'global',
    description: '大字体',
  },
  {
    name: 'text-xl',
    value: ['1.25rem', '1.75rem'],
    type: 'typography',
    category: 'global',
    description: '超大字体',
  },
  {
    name: 'text-2xl',
    value: ['1.5rem', '2rem'],
    type: 'typography',
    category: 'global',
    description: '2倍大字体',
  },
  {
    name: 'text-3xl',
    value: ['1.875rem', '2.25rem'],
    type: 'typography',
    category: 'global',
    description: '3倍大字体',
  },
  {
    name: 'text-4xl',
    value: ['2.25rem', '2.5rem'],
    type: 'typography',
    category: 'global',
    description: '4倍大字体',
  },
  {
    name: 'text-5xl',
    value: ['3rem', '1'],
    type: 'typography',
    category: 'global',
    description: '5倍大字体',
  },
  {
    name: 'text-6xl',
    value: ['3.75rem', '1'],
    type: 'typography',
    category: 'global',
    description: '6倍大字体',
  },
  {
    name: 'text-7xl',
    value: ['4.5rem', '1'],
    type: 'typography',
    category: 'global',
    description: '7倍大字体',
  },
  {
    name: 'text-8xl',
    value: ['6rem', '1'],
    type: 'typography',
    category: 'global',
    description: '8倍大字体',
  },
  {
    name: 'text-9xl',
    value: ['8rem', '1'],
    type: 'typography',
    category: 'global',
    description: '9倍大字体',
  },
]

/**
 * 字体粗细令牌
 */
export const fontWeightTokens: DesignToken[] = [
  {
    name: 'font-thin',
    value: '100',
    type: 'typography',
    category: 'global',
    description: '极细字体',
  },
  {
    name: 'font-extralight',
    value: '200',
    type: 'typography',
    category: 'global',
    description: '超细字体',
  },
  {
    name: 'font-light',
    value: '300',
    type: 'typography',
    category: 'global',
    description: '细字体',
  },
  {
    name: 'font-normal',
    value: '400',
    type: 'typography',
    category: 'global',
    description: '正常字体',
  },
  {
    name: 'font-medium',
    value: '500',
    type: 'typography',
    category: 'global',
    description: '中等字体',
  },
  {
    name: 'font-semibold',
    value: '600',
    type: 'typography',
    category: 'global',
    description: '半粗字体',
  },
  {
    name: 'font-bold',
    value: '700',
    type: 'typography',
    category: 'global',
    description: '粗字体',
  },
  {
    name: 'font-extrabold',
    value: '800',
    type: 'typography',
    category: 'global',
    description: '超粗字体',
  },
  {
    name: 'font-black',
    value: '900',
    type: 'typography',
    category: 'global',
    description: '极粗字体',
  },
]

/**
 * 行高令牌
 */
export const lineHeightTokens: DesignToken[] = [
  {
    name: 'leading-none',
    value: '1',
    type: 'typography',
    category: 'global',
    description: '无行高',
  },
  {
    name: 'leading-tight',
    value: '1.25',
    type: 'typography',
    category: 'global',
    description: '紧密行高',
  },
  {
    name: 'leading-snug',
    value: '1.375',
    type: 'typography',
    category: 'global',
    description: '紧凑行高',
  },
  {
    name: 'leading-normal',
    value: '1.5',
    type: 'typography',
    category: 'global',
    description: '正常行高',
  },
  {
    name: 'leading-relaxed',
    value: '1.625',
    type: 'typography',
    category: 'global',
    description: '宽松行高',
  },
  {
    name: 'leading-loose',
    value: '2',
    type: 'typography',
    category: 'global',
    description: '超宽松行高',
  },
]

/**
 * 边框圆角令牌
 */
export const borderRadiusTokens: DesignToken[] = [
  {
    name: 'rounded-none',
    value: '0',
    type: 'borderRadius',
    category: 'global',
    description: '无圆角',
  },
  {
    name: 'rounded-sm',
    value: 'calc(var(--radius) - 4px)',
    type: 'borderRadius',
    category: 'global',
    description: '小圆角',
  },
  {
    name: 'rounded',
    value: 'var(--radius)',
    type: 'borderRadius',
    category: 'global',
    description: '默认圆角',
  },
  {
    name: 'rounded-md',
    value: 'calc(var(--radius) - 2px)',
    type: 'borderRadius',
    category: 'global',
    description: '中等圆角',
  },
  {
    name: 'rounded-lg',
    value: 'var(--radius)',
    type: 'borderRadius',
    category: 'global',
    description: '大圆角',
  },
  {
    name: 'rounded-xl',
    value: 'calc(var(--radius) + 2px)',
    type: 'borderRadius',
    category: 'global',
    description: '超大圆角',
  },
  {
    name: 'rounded-2xl',
    value: 'calc(var(--radius) + 4px)',
    type: 'borderRadius',
    category: 'global',
    description: '2倍大圆角',
  },
  {
    name: 'rounded-3xl',
    value: 'calc(var(--radius) + 6px)',
    type: 'borderRadius',
    category: 'global',
    description: '3倍大圆角',
  },
  {
    name: 'rounded-full',
    value: '9999px',
    type: 'borderRadius',
    category: 'global',
    description: '完全圆角',
  },
]

/**
 * 阴影令牌
 */
export const shadowTokens: DesignToken[] = [
  {
    name: 'shadow-sm',
    value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    type: 'shadow',
    category: 'global',
    description: '小阴影',
  },
  {
    name: 'shadow',
    value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    type: 'shadow',
    category: 'global',
    description: '默认阴影',
  },
  {
    name: 'shadow-md',
    value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    type: 'shadow',
    category: 'global',
    description: '中等阴影',
  },
  {
    name: 'shadow-lg',
    value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    type: 'shadow',
    category: 'global',
    description: '大阴影',
  },
  {
    name: 'shadow-xl',
    value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    type: 'shadow',
    category: 'global',
    description: '超大阴影',
  },
  {
    name: 'shadow-2xl',
    value: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    type: 'shadow',
    category: 'global',
    description: '2倍大阴影',
  },
  {
    name: 'shadow-inner',
    value: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    type: 'shadow',
    category: 'global',
    description: '内阴影',
  },
  {
    name: 'shadow-none',
    value: '0 0 #0000',
    type: 'shadow',
    category: 'global',
    description: '无阴影',
  },
]

/**
 * 断点令牌
 */
export const breakpointTokens: DesignToken[] = [
  { name: 'sm', value: '640px', type: 'breakpoint', category: 'global', description: '小屏幕断点' },
  {
    name: 'md',
    value: '768px',
    type: 'breakpoint',
    category: 'global',
    description: '中等屏幕断点',
  },
  {
    name: 'lg',
    value: '1024px',
    type: 'breakpoint',
    category: 'global',
    description: '大屏幕断点',
  },
  {
    name: 'xl',
    value: '1280px',
    type: 'breakpoint',
    category: 'global',
    description: '超大屏幕断点',
  },
  {
    name: '2xl',
    value: '1536px',
    type: 'breakpoint',
    category: 'global',
    description: '2倍大屏幕断点',
  },
]

/**
 * Z轴层级令牌
 */
export const zIndexTokens: DesignToken[] = [
  { name: 'z-0', value: '0', type: 'zIndex', category: 'global', description: '默认层级' },
  { name: 'z-10', value: '10', type: 'zIndex', category: 'global', description: '低层级' },
  { name: 'z-20', value: '20', type: 'zIndex', category: 'global', description: '中层级' },
  { name: 'z-30', value: '30', type: 'zIndex', category: 'global', description: '高层级' },
  { name: 'z-40', value: '40', type: 'zIndex', category: 'global', description: '超高层级' },
  { name: 'z-50', value: '50', type: 'zIndex', category: 'global', description: '最高层级' },
  { name: 'z-auto', value: 'auto', type: 'zIndex', category: 'global', description: '自动层级' },
]

/**
 * 过渡动画令牌
 */
export const transitionTokens: DesignToken[] = [
  {
    name: 'transition-none',
    value: 'none',
    type: 'transition',
    category: 'global',
    description: '无过渡',
  },
  {
    name: 'transition-all',
    value: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    type: 'transition',
    category: 'global',
    description: '所有属性过渡',
  },
  {
    name: 'transition-colors',
    value:
      'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    type: 'transition',
    category: 'global',
    description: '颜色过渡',
  },
  {
    name: 'transition-opacity',
    value: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    type: 'transition',
    category: 'global',
    description: '透明度过渡',
  },
  {
    name: 'transition-shadow',
    value: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    type: 'transition',
    category: 'global',
    description: '阴影过渡',
  },
  {
    name: 'transition-transform',
    value: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    type: 'transition',
    category: 'global',
    description: '变换过渡',
  },
]

/**
 * 合并所有设计令牌
 */
export const allDesignTokens: DesignToken[] = [
  ...primitiveColorTokens,
  ...semanticColorTokens,
  ...spacingTokens,
  ...fontSizeTokens,
  ...fontWeightTokens,
  ...lineHeightTokens,
  ...borderRadiusTokens,
  ...shadowTokens,
  ...breakpointTokens,
  ...zIndexTokens,
  ...transitionTokens,
]

/**
 * 按类型分组的设计令牌
 */
export const tokensByType: Record<TokenType, DesignToken[]> = {
  color: [...primitiveColorTokens, ...semanticColorTokens],
  spacing: spacingTokens,
  typography: [...fontSizeTokens, ...fontWeightTokens, ...lineHeightTokens],
  shadow: shadowTokens,
  borderRadius: borderRadiusTokens,
  breakpoint: breakpointTokens,
  sizing: [], // 可以后续扩展
  zIndex: zIndexTokens,
  transition: transitionTokens,
}

/**
 * 按分类分组的设计令牌
 */
export const tokensByCategory: Record<TokenCategory, DesignToken[]> = {
  primitive: primitiveColorTokens,
  semantic: semanticColorTokens,
  component: [], // 可以后续扩展组件特定令牌
  global: [
    ...spacingTokens,
    ...fontSizeTokens,
    ...fontWeightTokens,
    ...lineHeightTokens,
    ...borderRadiusTokens,
    ...shadowTokens,
    ...breakpointTokens,
    ...zIndexTokens,
    ...transitionTokens,
  ],
}

/**
 * 根据名称获取令牌
 */
export function getTokenByName(name: string): DesignToken | undefined {
  return allDesignTokens.find(token => token.name === name)
}

/**
 * 根据类型获取令牌
 */
export function getTokensByType(type: TokenType): DesignToken[] {
  return tokensByType[type] || []
}

/**
 * 根据分类获取令牌
 */
export function getTokensByCategory(category: TokenCategory): DesignToken[] {
  return tokensByCategory[category] || []
}

/**
 * 获取CSS变量名
 */
export function getTokenCssVar(token: DesignToken): string {
  return `--token-${token.name.replace(/([A-Z])/g, '-$1').toLowerCase()}`
}

/**
 * 生成CSS变量定义
 */
export function generateTokenCSS(token: DesignToken): string {
  const cssVar = getTokenCssVar(token)
  let value = token.value

  // 处理数组类型的值（如字体大小）
  if (Array.isArray(value)) {
    value = value.join(' / ')
  }

  return `${cssVar}: ${value}; /* ${token.description || ''} */`
}

/**
 * 生成完整的CSS变量定义
 */
export function generateAllTokensCSS(): string {
  const cssStrings = allDesignTokens.map(generateTokenCSS)
  return `/* Design Tokens - 自动生成，请勿手动修改 */\n${cssStrings.join('\n')}`
}
