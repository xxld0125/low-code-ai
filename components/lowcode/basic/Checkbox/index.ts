/**
 * Checkbox组件导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

// 主要组件
export { Checkbox } from './Checkbox'
export type { LowcodeCheckboxProps } from './Checkbox'

// 验证组件
export { ValidatedCheckbox } from './ValidatedCheckbox'
export type { ValidatedCheckboxProps } from './ValidatedCheckbox'

// 组件定义
export { CheckboxDefinition } from './definition'

// 预览组件
export {
  CheckboxPreview,
  CheckboxVariantPreview,
  CheckboxStatePreview,
  CheckboxInteractivePreview,
  CheckboxDragPreview,
} from './Preview'
export type { CheckboxPreviewProps } from './Preview'

// 图标组件
export {
  CheckboxIcon,
  CheckboxUncheckedIcon,
  CheckboxCheckedIcon,
  CheckboxIndeterminateIcon,
  CheckboxSimpleIcon,
  CheckboxAnimatedIcon,
  CheckboxErrorIcon,
  CheckboxDisabledIcon,
} from './Icon'
export type { CheckboxIconProps } from './Icon'

// 默认导出
import { Checkbox as CheckboxComponent } from './Checkbox'
export default CheckboxComponent
