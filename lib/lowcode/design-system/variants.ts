/**
 * 组件样式变体(Variants)管理系统
 * 提供统一的组件样式变体定义和管理
 * 基于shadcn/ui的class-variance-authority(CVA)模式
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 基础组件变体类型
 */
export interface BaseVariants {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  state?: 'default' | 'hover' | 'active' | 'disabled' | 'loading'
}

/**
 * 按钮组件变体
 */
export const buttonVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 rounded px-2 text-xs',
        sm: 'h-9 rounded-md px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        '2xl': 'h-14 rounded-lg px-12 text-lg',
      },
      state: {
        default: '',
        loading: 'opacity-70 cursor-not-allowed',
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

/**
 * 输入框组件变体
 */
export const inputVariants = cva(
  // 基础样式
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500',
        outline: 'border-2 border-input',
      },
      size: {
        sm: 'h-9 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-11 px-4 text-base',
        xl: 'h-12 px-5 text-lg',
      },
      state: {
        default: '',
        error: 'border-destructive text-destructive placeholder:text-destructive/50',
        disabled: 'bg-muted cursor-not-allowed',
        readonly: 'bg-muted cursor-default',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
)

export type InputVariants = VariantProps<typeof inputVariants>

/**
 * 卡片组件变体
 */
export const cardVariants = cva(
  // 基础样式
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'shadow-md border-border/50',
        outlined: 'border-2 border-border bg-background',
        ghost: 'border-transparent bg-transparent shadow-none',
        filled: 'bg-muted border-transparent',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        '2xl': 'p-10',
      },
      state: {
        default: '',
        hover: 'hover:shadow-md transition-shadow',
        interactive: 'cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all',
        disabled: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
)

export type CardVariants = VariantProps<typeof cardVariants>

/**
 * 徽章组件变体
 */
export const badgeVariants = cva(
  // 基础样式
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
      },
      size: {
        xs: 'px-1.5 py-0 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-4 py-1.5 text-base',
      },
      state: {
        default: '',
        dot: 'relative pl-6 before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:h-2 before:w-2 before:rounded-full before:bg-current',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
)

export type BadgeVariants = VariantProps<typeof badgeVariants>

/**
 * 文本组件变体
 */
export const textVariants = cva(
  // 基础样式
  'text-foreground',
  {
    variants: {
      variant: {
        h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
        h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
        h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
        h6: 'scroll-m-20 text-base font-semibold tracking-tight',
        p: 'leading-7 [&:not(:first-child)]:mt-6',
        blockquote: 'mt-6 border-l-2 pl-6 italic',
        code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        lead: 'text-xl text-muted-foreground',
        large: 'text-lg font-semibold',
        small: 'text-sm font-medium leading-none',
        muted: 'text-sm text-muted-foreground',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl',
      },
      weight: {
        thin: 'font-thin',
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
      state: {
        default: '',
        muted: 'text-muted-foreground',
        accent: 'text-accent-foreground',
        destructive: 'text-destructive',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'p',
      size: 'md',
      weight: 'normal',
      align: 'left',
      state: 'default',
    },
  }
)

export type TextVariants = VariantProps<typeof textVariants>

/**
 * 容器组件变体
 */
export const containerVariants = cva(
  // 基础样式
  'w-full',
  {
    variants: {
      variant: {
        default: '',
        fluid: 'max-w-none',
        constrained: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        centered: 'max-w-4xl mx-auto',
        narrow: 'max-w-2xl mx-auto',
        wide: 'max-w-screen-2xl mx-auto',
      },
      padding: {
        none: '',
        sm: 'p-2 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
        xl: 'p-8 sm:p-12',
        '2xl': 'p-12 sm:p-16',
      },
      background: {
        none: '',
        muted: 'bg-muted',
        card: 'bg-card border',
        accent: 'bg-accent',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
      },
      state: {
        default: '',
        hover: 'transition-colors hover:bg-muted/50',
        interactive: 'cursor-pointer transition-all hover:shadow-md',
        disabled: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'none',
      background: 'none',
      state: 'default',
    },
  }
)

export type ContainerVariants = VariantProps<typeof containerVariants>

/**
 * 网格组件变体
 */
export const gridVariants = cva(
  // 基础样式
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
        12: 'grid-cols-12',
        auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
        'auto-sm': 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
        'auto-lg': 'grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
      },
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
      },
      variant: {
        default: '',
        compact: 'gap-2',
        spacious: 'gap-8',
        responsive: 'gap-4 sm:gap-6 lg:gap-8',
      },
    },
    defaultVariants: {
      cols: 'auto',
      gap: 'md',
      variant: 'default',
    },
  }
)

export type GridVariants = VariantProps<typeof gridVariants>

/**
 * Flexbox组件变体
 */
export const flexVariants = cva(
  // 基础样式
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        column: 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'column-reverse': 'flex-col-reverse',
        responsive: 'flex-col sm:flex-row',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      },
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
      },
    },
    defaultVariants: {
      direction: 'row',
      align: 'start',
      justify: 'start',
      wrap: 'nowrap',
      gap: 'md',
    },
  }
)

export type FlexVariants = VariantProps<typeof flexVariants>

/**
 * 分隔符组件变体
 */
export const dividerVariants = cva(
  // 基础样式
  'shrink-0 bg-border',
  {
    variants: {
      orientation: {
        horizontal: 'h-[1px] w-full',
        vertical: 'h-full w-[1px]',
      },
      variant: {
        default: '',
        dotted: 'border-dashed border-0 border-t border-border',
        thick: 'h-px bg-border/50',
        light: 'bg-border/50',
        strong: 'bg-foreground/20',
      },
      spacing: {
        none: '',
        sm: 'my-2 mx-2',
        md: 'my-4 mx-4',
        lg: 'my-6 mx-6',
        xl: 'my-8 mx-8',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'default',
      spacing: 'md',
    },
  }
)

export type DividerVariants = VariantProps<typeof dividerVariants>

/**
 * 间距组件变体
 */
export const spacerVariants = cva(
  // 基础样式
  'shrink-0',
  {
    variants: {
      size: {
        xs: 'w-2 h-2',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
        '2xl': 'w-16 h-16',
        '3xl': 'w-20 h-20',
        '4xl': 'w-24 h-24',
      },
      direction: {
        horizontal: 'w-full h-auto',
        vertical: 'w-auto h-full',
        both: '',
      },
      responsive: {
        false: '',
        true: 'w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8',
      },
    },
    defaultVariants: {
      size: 'md',
      direction: 'both',
      responsive: false,
    },
  }
)

export type SpacerVariants = VariantProps<typeof spacerVariants>

/**
 * 所有组件变体的映射
 */
export const componentVariants = {
  button: buttonVariants,
  input: inputVariants,
  card: cardVariants,
  badge: badgeVariants,
  text: textVariants,
  container: containerVariants,
  grid: gridVariants,
  flex: flexVariants,
  divider: dividerVariants,
  spacer: spacerVariants,
}

/**
 * 组件变体类型映射
 */
export type ComponentVariantsType = {
  button: ButtonVariants
  input: InputVariants
  card: CardVariants
  badge: BadgeVariants
  text: TextVariants
  container: ContainerVariants
  grid: GridVariants
  flex: FlexVariants
  divider: DividerVariants
  spacer: SpacerVariants
}

/**
 * 获取组件变体类名
 */
export function getVariantClasses<T extends keyof ComponentVariantsType>(
  component: T,
  props: ComponentVariantsType[T]
): string {
  const variantFunction = componentVariants[component]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return variantFunction(props as any)
}

/**
 * 合并变体类名
 */
export function mergeVariantClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 响应式变体工具函数
 */
export function responsiveVariant<T extends Record<string, string>>(
  variant: T,
  breakpointValues?: Partial<Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', keyof T>>
): string {
  const baseClass = variant.default || ''
  const responsiveClasses = breakpointValues
    ? Object.entries(breakpointValues)
        .map(([breakpoint, variantKey]) => {
          const className = variant[variantKey as keyof T]
          return className ? `${breakpoint}:${className}` : ''
        })
        .filter(Boolean)
        .join(' ')
    : ''

  return mergeVariantClasses(baseClass, responsiveClasses)
}
