/**
 * Input组件导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

// 主要组件
export { Input } from './Input'
export type { LowcodeInputProps } from './Input'

// 验证组件
export { ValidatedInput } from './ValidatedInput'
export type { ValidatedInputProps } from './ValidatedInput'

// 组件定义
export { InputDefinition } from './definition'

// 预览组件
export { InputPreview, InputTypePreview, InputStatePreview, InputDragPreview } from './Preview'
export type { InputPreviewProps } from './Preview'

// 图标组件
export {
  InputIcon,
  InputTextIcon,
  InputPasswordIcon,
  InputEmailIcon,
  InputNumberIcon,
  InputSearchIcon,
  InputSimpleIcon,
  InputFocusedIcon,
} from './Icon'
export type { InputIconProps } from './Icon'

// 默认导出 - 直接导入再导出
import { Input as InputComponent } from './Input'
export default InputComponent
