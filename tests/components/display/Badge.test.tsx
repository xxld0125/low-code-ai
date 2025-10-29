import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/lowcode/display/Badge/Badge'

describe('Badge组件', () => {
  test('正确渲染默认徽章', () => {
    render(<Badge />)

    const badge = screen.getByText('徽章')
    expect(badge).toBeInTheDocument()
  })

  test('支持自定义文本内容', () => {
    render(<Badge content="自定义徽章" />)

    const badge = screen.getByText('自定义徽章')
    expect(badge).toBeInTheDocument()
  })

  test('支持自定义className', () => {
    render(<Badge className="custom-badge-class" />)

    const badge = screen.getByText('徽章')
    expect(badge).toHaveClass('custom-badge-class')
  })

  test('正确应用default变体样式', () => {
    render(<Badge variant="default" />)

    const badge = screen.getByText('徽章')
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary/90')
  })

  test('正确应用secondary变体样式', () => {
    render(<Badge variant="secondary" />)

    const badge = screen.getByText('徽章')
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80')
  })

  test('正确应用destructive变体样式', () => {
    render(<Badge variant="destructive" />)

    const badge = screen.getByText('徽章')
    expect(badge).toHaveClass(
      'bg-destructive',
      'text-destructive-foreground',
      'hover:bg-destructive/90'
    )
  })

  test('正确应用outline变体样式', () => {
    render(<Badge variant="outline" />)

    const badge = screen.getByText('徽章')
    expect(badge).toHaveClass(
      'border',
      'border-input',
      'text-foreground',
      'bg-background',
      'hover:bg-accent'
    )
  })

  test('正确应用尺寸样式', () => {
    const { rerender } = render(<Badge size="sm" />)
    expect(screen.getByText('徽章')).toHaveClass('text-xs', 'px-2', 'py-0.5')

    rerender(<Badge size="default" />)
    expect(screen.getByText('徽章')).toHaveClass('text-sm', 'px-2.5', 'py-0.5')

    rerender(<Badge size="lg" />)
    expect(screen.getByText('徽章')).toHaveClass('text-base', 'px-3', 'py-1')
  })

  test('正确应用圆角样式', () => {
    const { rerender } = render(<Badge rounded="none" />)
    expect(screen.getByText('徽章')).not.toHaveClass('rounded')

    rerender(<Badge rounded="sm" />)
    expect(screen.getByText('徽章')).toHaveClass('rounded-sm')

    rerender(<Badge rounded="md" />)
    expect(screen.getByText('徽章')).toHaveClass('rounded-md')

    rerender(<Badge rounded="lg" />)
    expect(screen.getByText('徽章')).toHaveClass('rounded-lg')

    rerender(<Badge rounded="full" />)
    expect(screen.getByText('徽章')).toHaveClass('rounded-full')
  })

  test('具有正确的可访问性属性', () => {
    render(<Badge />)

    const badge = screen.getByText('徽章')
    expect(badge).toHaveAttribute('role', 'status')
    expect(badge).toHaveAttribute('aria-label', '徽章')
  })
})
