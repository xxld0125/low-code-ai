/**
 * 设计系统使用示例
 * 展示如何在组件中使用设计系统的主题、令牌和变体
 */

import * as React from 'react'
import {
  getVariantClasses,
  mergeVariantClasses,
  type ButtonVariants,
  type CardVariants,
  type InputVariants,
  type TextVariants,
  type BadgeVariants,
} from './variants'
import { generateResponsiveClass } from './index'

/**
 * 按钮组件示例
 */
export const ExampleButton: React.FC<
  ButtonVariants & {
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }
> = ({ variant, size, state, children, onClick, className }) => {
  const baseClasses = getVariantClasses('button', { variant, size, state })
  const finalClasses = mergeVariantClasses(baseClasses, className)

  return (
    <button className={finalClasses} onClick={onClick} disabled={state === 'disabled'}>
      {children}
    </button>
  )
}

/**
 * 卡片组件示例
 */
export const ExampleCard: React.FC<
  CardVariants & {
    children: React.ReactNode
    title?: string
    className?: string
  }
> = ({ variant, size, state, children, title, className }) => {
  const baseClasses = getVariantClasses('card', { variant, size, state })
  const finalClasses = mergeVariantClasses(baseClasses, className)

  return (
    <div className={finalClasses}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

/**
 * 输入框组件示例
 */
export const ExampleInput: React.FC<
  InputVariants & {
    placeholder?: string
    value?: string
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    onChange?: (value: string) => void
    className?: string
  }
> = ({ variant, size, state, placeholder, value, type = 'text', onChange, className }) => {
  const baseClasses = getVariantClasses('input', { variant, size, state })
  const finalClasses = mergeVariantClasses(baseClasses, className)

  return (
    <input
      type={type}
      className={finalClasses}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={state === 'disabled'}
      readOnly={state === 'readonly'}
    />
  )
}

/**
 * 文本组件示例
 */
export const ExampleText: React.FC<
  TextVariants & {
    children: React.ReactNode
    className?: string
  }
> = ({ variant, size, weight, align, state, children, className }) => {
  const baseClasses = getVariantClasses('text', { variant, size, weight, align, state })
  const finalClasses = mergeVariantClasses(baseClasses, className)

  if (variant?.startsWith('h')) {
    const Tag = variant as keyof React.JSX.IntrinsicElements
    return <Tag className={finalClasses}>{children}</Tag>
  }

  return <p className={finalClasses}>{children}</p>
}

/**
 * 徽章组件示例
 */
export const ExampleBadge: React.FC<
  BadgeVariants & {
    children: React.ReactNode
    className?: string
  }
> = ({ variant, size, state, children, className }) => {
  const baseClasses = getVariantClasses('badge', { variant, size, state })
  const finalClasses = mergeVariantClasses(baseClasses, className)

  return <span className={finalClasses}>{children}</span>
}

/**
 * 响应式布局示例
 */
export const ResponsiveLayout: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  const responsiveClasses = generateResponsiveClass('w-full', {
    mobile: 'px-2',
    tablet: 'px-4',
    desktop: 'px-8',
  })

  return <div className={mergeVariantClasses(responsiveClasses, className)}>{children}</div>
}

/**
 * 主题感知组件示例
 */
export const ThemedComponent: React.FC<{
  theme?: 'light' | 'dark' | 'high-contrast'
  children: React.ReactNode
}> = ({ theme, children }) => {
  const themeClasses = theme ? `theme-${theme}` : ''

  return (
    <div className={themeClasses} data-theme={theme}>
      <div className="rounded-lg border bg-background p-4 text-foreground">{children}</div>
    </div>
  )
}

/**
 * 状态徽章组件示例
 */
export const StatusBadge: React.FC<{
  status: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
}> = ({ status, children }) => {
  const variantMap = {
    success: 'success' as const,
    warning: 'warning' as const,
    error: 'destructive' as const,
    info: 'info' as const,
  }

  return <ExampleBadge variant={variantMap[status]}>{children}</ExampleBadge>
}

/**
 * 表单组示例
 */
export const FormGroup: React.FC<{
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}> = ({ label, error, required, children }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

/**
 * 页面标题组件示例
 */
export const PageTitle: React.FC<{
  title: string
  subtitle?: string
  actions?: React.ReactNode
}> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <ExampleText variant="h1" className="mb-2">
          {title}
        </ExampleText>
        {subtitle && (
          <ExampleText variant="lead" state="muted">
            {subtitle}
          </ExampleText>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

/**
 * 组件网格示例
 */
export const ComponentGrid: React.FC<{
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 6 | 12 | 'auto'
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}> = ({ children, cols = 'auto', gap = 'md', className }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridClasses = getVariantClasses('grid', { cols, gap } as any)
  const finalClasses = mergeVariantClasses(gridClasses, className)

  return <div className={finalClasses}>{children}</div>
}

/**
 * 使用示例集合
 */
export const DesignSystemExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <PageTitle title="设计系统示例" subtitle="展示设计系统组件的使用方法" />

      {/* 按钮示例 */}
      <ExampleCard title="按钮组件">
        <div className="flex flex-wrap gap-4">
          <ExampleButton variant="default" size="md">
            默认按钮
          </ExampleButton>
          <ExampleButton variant="secondary" size="md">
            次要按钮
          </ExampleButton>
          <ExampleButton variant="outline" size="md">
            轮廓按钮
          </ExampleButton>
          <ExampleButton variant="destructive" size="md">
            危险按钮
          </ExampleButton>
          <ExampleButton variant="ghost" size="md">
            幽灵按钮
          </ExampleButton>
        </div>
      </ExampleCard>

      {/* 输入框示例 */}
      <ExampleCard title="输入框组件">
        <div className="max-w-md space-y-4">
          <FormGroup label="用户名" required>
            <ExampleInput placeholder="请输入用户名" />
          </FormGroup>
          <FormGroup label="邮箱" error="邮箱格式不正确">
            <ExampleInput variant="destructive" placeholder="请输入邮箱" />
          </FormGroup>
          <FormGroup label="密码">
            <ExampleInput type="password" placeholder="请输入密码" />
          </FormGroup>
        </div>
      </ExampleCard>

      {/* 徽章示例 */}
      <ExampleCard title="徽章组件">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="success">成功</StatusBadge>
          <StatusBadge status="warning">警告</StatusBadge>
          <StatusBadge status="error">错误</StatusBadge>
          <StatusBadge status="info">信息</StatusBadge>
          <ExampleBadge variant="outline">默认</ExampleBadge>
          <ExampleBadge variant="secondary">次要</ExampleBadge>
        </div>
      </ExampleCard>

      {/* 文本示例 */}
      <ExampleCard title="文本组件">
        <div className="space-y-4">
          <ExampleText variant="h1">一级标题</ExampleText>
          <ExampleText variant="h2">二级标题</ExampleText>
          <ExampleText variant="h3">三级标题</ExampleText>
          <ExampleText variant="p" size="lg">
            这是一段普通的段落文本，展示了默认的文本样式和大小。
          </ExampleText>
          <ExampleText variant="muted">这是静音状态的文本，通常用于次要信息。</ExampleText>
        </div>
      </ExampleCard>

      {/* 网格布局示例 */}
      <ExampleCard title="网格布局">
        <ComponentGrid cols={3} gap="lg">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-lg bg-muted p-4 text-center">
              卡片 {i}
            </div>
          ))}
        </ComponentGrid>
      </ExampleCard>

      {/* 主题示例 */}
      <ExampleCard title="主题切换">
        <div className="space-y-4">
          <ThemedComponent theme="light">
            <ExampleText>明亮主题示例</ExampleText>
          </ThemedComponent>
          <ThemedComponent theme="dark">
            <ExampleText>暗黑主题示例</ExampleText>
          </ThemedComponent>
          <ThemedComponent theme="high-contrast">
            <ExampleText>高对比度主题示例</ExampleText>
          </ThemedComponent>
        </div>
      </ExampleCard>
    </div>
  )
}

/**
 * 导出所有示例组件
 */
export const DesignSystemExports = {
  ExampleButton,
  ExampleCard,
  ExampleInput,
  ExampleText,
  ExampleBadge,
  ResponsiveLayout,
  ThemedComponent,
  StatusBadge,
  FormGroup,
  PageTitle,
  ComponentGrid,
  DesignSystemExamples,
}

export default DesignSystemExports
