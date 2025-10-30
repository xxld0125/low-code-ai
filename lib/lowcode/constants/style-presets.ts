/**
 * 样式预设值配置
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

export interface SizePreset {
  label: string
  value: string
  description?: string
}

export interface ColorPreset {
  label: string
  value: string
  category: string
}

export interface ShadowPreset {
  label: string
  value: string
  description?: string
}

// 尺寸预设值
export const SIZE_PRESETS: SizePreset[] = [
  { label: '0', value: '0', description: '无尺寸' },
  { label: 'XS', value: '4px', description: '极小' },
  { label: 'SM', value: '8px', description: '小' },
  { label: 'MD', value: '16px', description: '中等' },
  { label: 'LG', value: '24px', description: '大' },
  { label: 'XL', value: '32px', description: '极大' },
  { label: '2XL', value: '48px', description: '超大' },
  { label: '3XL', value: '64px', description: '最大' },
  { label: 'Auto', value: 'auto', description: '自动' },
] as const

// 字体大小预设值
export const FONT_SIZE_PRESETS: SizePreset[] = [
  { label: '极小', value: '12px', description: '辅助文本' },
  { label: '小', value: '14px', description: '小号文本' },
  { label: '正常', value: '16px', description: '正文大小' },
  { label: '中等', value: '18px', description: '中等文本' },
  { label: '大', value: '20px', description: '大号文本' },
  { label: '较大', value: '24px', description: '较大文本' },
  { label: '标题', value: '28px', description: '小标题' },
  { label: '大标题', value: '32px', description: '大标题' },
  { label: '特大标题', value: '48px', description: '特大标题' },
] as const

// 间距预设值
export const SPACING_PRESETS: SizePreset[] = [
  { label: '0', value: '0', description: '无间距' },
  { label: '1', value: '4px', description: '极小间距' },
  { label: '2', value: '8px', description: '小间距' },
  { label: '3', value: '12px', description: '中小间距' },
  { label: '4', value: '16px', description: '标准间距' },
  { label: '5', value: '20px', description: '中等间距' },
  { label: '6', value: '24px', description: '大间距' },
  { label: '8', value: '32px', description: '极大间距' },
  { label: '10', value: '40px', description: '超大间距' },
  { label: '12', value: '48px', description: '最大间距' },
  { label: '16', value: '64px', description: '特大间距' },
] as const

// 圆角预设值
export const BORDER_RADIUS_PRESETS: SizePreset[] = [
  { label: '无', value: '0', description: '无圆角' },
  { label: '小', value: '4px', description: '小圆角' },
  { label: '标准', value: '8px', description: '标准圆角' },
  { label: '中等', value: '12px', description: '中等圆角' },
  { label: '大', value: '16px', description: '大圆角' },
  { label: '极大', value: '24px', description: '极大圆角' },
  { label: '全圆', value: '9999px', description: '完全圆角' },
] as const

// 颜色预设值
export const COLOR_PRESETS: ColorPreset[] = [
  // 主色调
  { label: '主色', value: '#3b82f6', category: 'primary' },
  { label: '主色悬停', value: '#2563eb', category: 'primary' },

  // 中性色
  { label: '黑色', value: '#000000', category: 'neutral' },
  { label: '深灰', value: '#374151', category: 'neutral' },
  { label: '中灰', value: '#6b7280', category: 'neutral' },
  { label: '浅灰', value: '#9ca3af', category: 'neutral' },
  { label: '极浅灰', value: '#e5e7eb', category: 'neutral' },
  { label: '白色', value: '#ffffff', category: 'neutral' },

  // 状态色
  { label: '成功', value: '#10b981', category: 'success' },
  { label: '警告', value: '#f59e0b', category: 'warning' },
  { label: '错误', value: '#ef4444', category: 'error' },
  { label: '信息', value: '#06b6d4', category: 'info' },

  // 背景色
  { label: '背景主', value: '#ffffff', category: 'background' },
  { label: '背景次', value: '#f9fafb', category: 'background' },
  { label: '背景三级', value: '#f3f4f6', category: 'background' },

  // 边框色
  { label: '边框主', value: '#d1d5db', category: 'border' },
  { label: '边框次', value: '#e5e7eb', category: 'border' },

  // 文本色
  { label: '文本主', value: '#111827', category: 'text' },
  { label: '文本次', value: '#6b7280', category: 'text' },
  { label: '文本三级', value: '#9ca3af', category: 'text' },
] as const

// 阴影预设值
export const SHADOW_PRESETS: ShadowPreset[] = [
  { label: '无', value: 'none', description: '无阴影' },
  { label: '小', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', description: '小阴影' },
  {
    label: '标准',
    value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    description: '标准阴影',
  },
  {
    label: '中等',
    value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    description: '中等阴影',
  },
  {
    label: '大',
    value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    description: '大阴影',
  },
  {
    label: '极大',
    value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    description: '极大阴影',
  },
  { label: '内阴影', value: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', description: '内阴影' },
] as const

// 边框样式预设
export const BORDER_STYLE_PRESETS = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
  { label: '双线', value: 'double' },
  { label: '无', value: 'none' },
  { label: '隐藏', value: 'hidden' },
] as const

// 字体粗细预设
export const FONT_WEIGHT_PRESETS = [
  { label: '细', value: '300' },
  { label: '正常', value: '400' },
  { label: '中等', value: '500' },
  { label: '半粗', value: '600' },
  { label: '粗', value: '700' },
  { label: '特粗', value: '800' },
  { label: '最粗', value: '900' },
] as const

// 行高预设
export const LINE_HEIGHT_PRESETS = [
  { label: '紧密', value: '1' },
  { label: '较紧', value: '1.25' },
  { label: '正常', value: '1.5' },
  { label: '较松', value: '1.75' },
  { label: '松散', value: '2' },
] as const

// 获取特定类别的预设值
export const getPresetsByCategory = (category: string) => {
  return COLOR_PRESETS.filter(preset => preset.category === category)
}

// 获取尺寸预设值（根据类型）
export const getSizePresets = (
  type: 'size' | 'font-size' | 'spacing' | 'border-radius' = 'size'
) => {
  switch (type) {
    case 'font-size':
      return FONT_SIZE_PRESETS
    case 'spacing':
      return SPACING_PRESETS
    case 'border-radius':
      return BORDER_RADIUS_PRESETS
    default:
      return SIZE_PRESETS
  }
}
