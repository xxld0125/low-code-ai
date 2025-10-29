/**
 * 测试专用类型声明
 * 为测试文件提供简化的组件接口
 */

// 响应式尺寸类型
type ResponsiveSize = {
  base: string
  md?: string
  lg?: string
  [key: string]: string | undefined
}

// 响应式变体类型
type ResponsiveVariant = {
  base: string
  md?: string
  lg?: string
  [key: string]: string | undefined
}

// 选择器选项类型
interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

// 选择器分组类型
interface SelectGroup {
  label: string
  options: SelectOption[]
}

declare module '@/components/lowcode/basic/Button' {
  import { ComponentRendererProps } from '@/types/page-designer/component'

  interface TestButtonProps {
    text?: string
    variant?: string | ResponsiveVariant
    size?: string | ResponsiveSize
    disabled?: boolean
    loading?: boolean
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    className?: string
    [key: string]: unknown
  }

  export const Button: React.FC<TestButtonProps | ComponentRendererProps>
  export const PageButton: React.FC<ComponentRendererProps>
}

declare module '@/components/lowcode/basic/Input' {
  import { ComponentRendererProps } from '@/types/page-designer/component'

  interface TestInputProps {
    type?: string
    placeholder?: string
    value?: string
    defaultValue?: string
    disabled?: boolean
    required?: boolean
    readOnly?: boolean
    error?: string
    helperText?: string
    className?: string
    size?: string | ResponsiveSize
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
    [key: string]: unknown
  }

  export const Input: React.FC<TestInputProps | ComponentRendererProps>
  export const PageInput: React.FC<ComponentRendererProps>
}

declare module '@/components/lowcode/basic/Checkbox' {
  import { ComponentRendererProps } from '@/types/page-designer/component'

  interface TestCheckboxProps {
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    indeterminate?: boolean
    required?: boolean
    error?: string
    helperText?: string
    className?: string
    size?: string | ResponsiveSize
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
    children?: React.ReactNode
    [key: string]: unknown
  }

  export const Checkbox: React.FC<TestCheckboxProps | ComponentRendererProps>
}

declare module '@/components/lowcode/basic/Radio' {
  import { ComponentRendererProps } from '@/types/page-designer/component'

  interface TestRadioProps {
    name?: string
    value?: string
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    required?: boolean
    error?: string
    helperText?: string
    className?: string
    size?: string | ResponsiveSize
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
    children?: React.ReactNode
    [key: string]: unknown
  }

  export const Radio: React.FC<TestRadioProps | ComponentRendererProps>
}

declare module '@/components/lowcode/basic/Select' {
  import { ComponentRendererProps } from '@/types/page-designer/component'

  interface TestSelectProps {
    options?: Array<SelectOption | SelectGroup> | Promise<SelectOption[]>
    value?: string | string[]
    defaultValue?: string | string[]
    placeholder?: string
    disabled?: boolean
    required?: boolean
    error?: string
    helperText?: string
    className?: string
    searchable?: boolean
    clearable?: boolean
    multiple?: boolean
    loading?: boolean
    size?: string | number | ResponsiveSize
    onChange?: (value: string | string[]) => void
    onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void
    onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void
    [key: string]: unknown
  }

  export const Select: React.FC<TestSelectProps | ComponentRendererProps>
}

declare module '@/components/lowcode/basic/Textarea' {
  import { ComponentRendererProps } from '@/types/page-designer/component'

  interface TestTextareaProps {
    placeholder?: string
    value?: string
    defaultValue?: string
    disabled?: boolean
    required?: boolean
    readOnly?: boolean
    error?: string
    helperText?: string
    className?: string
    rows?: number
    cols?: number
    maxLength?: number
    minLength?: number
    resize?: string
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
    onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
    onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
    onInput?: (event: React.FormEvent<HTMLTextAreaElement>) => void
    [key: string]: unknown
  }

  export const Textarea: React.FC<TestTextareaProps | ComponentRendererProps>
}
