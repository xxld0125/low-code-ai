/**
 * 组件注册系统导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 * 更新日期: 2025-10-29 (T045任务完成 - 表单组件注册)
 */

// 类型定义导出
export * from './types'

// 属性定义和验证系统导出 (T006任务完成)
export {
  PropValidator,
  ResponsivePropManager,
  PropDependencyManager,
  PropEditorConfigGenerator,
  PropDefaultValueHandler,
  PropDefinitionManager,
  createPropSchema,
  validatePropSchema,
} from './property-definitions'

// 组件注册系统核心类导出 (T005任务)
export { ComponentRegistry, getComponentRegistry, defaultRegistry } from './component-registry'

// 验证规则引擎导出 (T007任务) - 避免命名冲突
export { ValidationRuleType, ValidationEngine } from './validation-rules'

export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationContext,
  ValidatorFunction,
  ValidationRule as RegistryValidationRule,
} from './validation-rules'

// 表单组件定义导入 (T045任务完成)
import { ButtonDefinition } from '../basic/Button/definition'
import { InputDefinition } from '../basic/Input/definition'
import { TextareaDefinition } from '../basic/Textarea/definition'
import { SelectDefinition } from '../basic/Select/definition'
import { CheckboxDefinition } from '../basic/Checkbox/definition'
import { RadioDefinition } from '../basic/Radio/definition'

// 展示组件定义导入 (T074任务完成)
import { TextDefinition } from '../display/Text/definition'
import { HeadingDefinition } from '../display/Heading/definition'
import { ImageDefinition } from '../display/Image/definition'
import { CardDefinition } from '../display/Card/definition'
import { BadgeDefinition } from '../display/Badge/definition'

// 表单组件定义导出
export {
  ButtonDefinition,
  InputDefinition,
  TextareaDefinition,
  SelectDefinition,
  CheckboxDefinition,
  RadioDefinition,
}

// 展示组件定义导出
export { TextDefinition, HeadingDefinition, ImageDefinition, CardDefinition, BadgeDefinition }

// 表单组件导出
export { Button, type LowcodeButtonProps } from '../basic/Button'

export { Input, type LowcodeInputProps } from '../basic/Input'

export { Textarea, type LowcodeTextareaProps } from '../basic/Textarea'

export { Select, type LowcodeSelectProps } from '../basic/Select'

export { Checkbox, type LowcodeCheckboxProps } from '../basic/Checkbox'

export { Radio, type LowcodeRadioProps } from '../basic/Radio'

// 预览组件导出 - 只导出基础预览组件
export { ButtonPreview } from '../basic/Button'

export { InputPreview } from '../basic/Input'

export { TextareaPreview } from '../basic/Textarea'

export { SelectPreview } from '../basic/Select'

export { CheckboxPreview } from '../basic/Checkbox'

export { RadioPreview } from '../basic/Radio'

// 图标组件导出 - 只导出存在的基础图标
export { ButtonIcon } from '../basic/Button'

export { InputIcon } from '../basic/Input'

export { TextareaIcon } from '../basic/Textarea'

export { SelectIcon } from '../basic/Select'

export {
  CheckboxIcon,
  CheckboxUncheckedIcon,
  CheckboxIndeterminateIcon,
  CheckboxErrorIcon,
} from '../basic/Checkbox'

// Radio组件图标暂时不导出，因为图标组件尚未实现

// 展示组件导出
export { Text, type LowcodeTextProps } from '../display/Text'
export { Heading, type LowcodeHeadingProps } from '../display/Heading'
export { Image, type LowcodeImageProps } from '../display/Image'
export { Card, type LowcodeCardProps } from '../display/Card'
export { Badge, type LowcodeBadgeProps } from '../display/Badge'

// 展示预览组件导出
export { TextPreview } from '../display/Text'
export { HeadingPreview } from '../display/Heading'
export { ImagePreview } from '../display/Image'
export { CardPreview } from '../display/Card'
export { BadgePreview } from '../display/Badge'

// 展示图标组件导出
export { TextIcon } from '../display/Text'
export { HeadingIcon } from '../display/Heading'
export { ImageIcon } from '../display/Image'
export { CardIcon } from '../display/Card'
export { BadgeIcon } from '../display/Badge'

// 所有表单组件定义数组，用于批量注册
export const FORM_COMPONENT_DEFINITIONS = [
  ButtonDefinition,
  InputDefinition,
  TextareaDefinition,
  SelectDefinition,
  CheckboxDefinition,
  RadioDefinition,
] as const

// 所有展示组件定义数组，用于批量注册
export const DISPLAY_COMPONENT_DEFINITIONS = [
  TextDefinition,
  HeadingDefinition,
  ImageDefinition,
  CardDefinition,
  BadgeDefinition,
] as const

// 所有组件定义数组，用于批量注册
export const ALL_COMPONENT_DEFINITIONS = [
  ...FORM_COMPONENT_DEFINITIONS,
  ...DISPLAY_COMPONENT_DEFINITIONS,
] as const

// 组件分类常量
export const COMPONENT_CATEGORIES = {
  BASIC: 'basic',
  DISPLAY: 'display',
  LAYOUT: 'layout',
  FORM: 'form',
  ADVANCED: 'advanced',
  CUSTOM: 'custom',
} as const

// 表单组件类型常量
export const FORM_COMPONENT_TYPES = {
  BUTTON: 'button',
  INPUT: 'input',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
} as const

// 展示组件类型常量
export const DISPLAY_COMPONENT_TYPES = {
  TEXT: 'text',
  HEADING: 'heading',
  IMAGE: 'image',
  CARD: 'card',
  BADGE: 'badge',
} as const

// 所有组件类型常量
export const ALL_COMPONENT_TYPES = {
  ...FORM_COMPONENT_TYPES,
  ...DISPLAY_COMPONENT_TYPES,
} as const
