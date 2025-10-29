/**
 * Textarea组件导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

// 主要组件
export type { LowcodeTextareaProps } from './Textarea'
export { useAutoResize, useCharacterCount } from './Textarea'

// 组件定义
export { TextareaDefinition } from './definition'

// 预览组件
export {
  TextareaPreview,
  TextareaVariantPreview,
  TextareaStatePreview,
  TextareaSizePreview,
  TextareaInteractivePreview,
} from './Preview'
export type { TextareaPreviewProps } from './Preview'

// 图标组件
export {
  TextareaIcon,
  TextareaFilledIcon,
  TextareaOutlinedIcon,
  TextareaDashedIcon,
  TextareaSimpleIcon,
  TextareaAnimatedIcon,
  TextareaCounterIcon,
  TextareaErrorIcon,
  TextareaSuccessIcon,
} from './Icon'
export type { TextareaIconProps } from './Icon'

// 默认导出
export { Textarea } from './Textarea'
