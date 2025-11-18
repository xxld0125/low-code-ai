import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const componentCardVariants = cva(
  'group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-all duration-200 hover:border-solid hover:shadow-md',
  {
    variants: {
      variant: {
        default:
          'border-component-border bg-component-bg hover:border-primary/50 hover:bg-primary/5',
        selected: 'border-primary bg-primary/10 shadow-md',
        dragging: 'border-drag-preview bg-primary/20 shadow-lg scale-105',
        disabled: 'border-muted bg-muted/50 cursor-not-allowed opacity-50',
      },
      size: {
        default: 'h-20 w-full',
        compact: 'h-16 w-full',
        large: 'h-24 w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ComponentCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentCardVariants> {
  icon?: React.ReactNode
  title: string
  description?: string
  badge?: string
  selected?: boolean
  dragging?: boolean
}

const ComponentCard = React.forwardRef<HTMLDivElement, ComponentCardProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      title,
      description,
      badge,
      selected,
      dragging,
      children,
      ...props
    },
    ref
  ) => {
    const computedVariant = selected ? 'selected' : dragging ? 'dragging' : variant

    return (
      <div
        ref={ref}
        className={cn(componentCardVariants({ variant: computedVariant, size, className }))}
        {...props}
      >
        {/* 徽章 */}
        {badge && (
          <div className="absolute right-1 top-1">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {badge}
            </span>
          </div>
        )}

        {/* 图标 */}
        {icon && (
          <div className="mb-2 text-muted-foreground transition-colors group-hover:text-primary">
            {icon}
          </div>
        )}

        {/* 标题 */}
        <div className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
          {title}
        </div>

        {/* 描述 */}
        {description && <div className="mt-1 text-xs text-muted-foreground">{description}</div>}

        {/* 子元素 */}
        {children}
      </div>
    )
  }
)
ComponentCard.displayName = 'ComponentCard'

export { ComponentCard, componentCardVariants }
