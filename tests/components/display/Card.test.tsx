import { render, screen } from '@testing-library/react'
import { Card } from '@/components/lowcode/display/Card/Card'

describe('Card组件', () => {
  test('正确渲染默认卡片', () => {
    render(<Card />)

    const card = document.querySelector('[role="region"]') || document.querySelector('div')
    expect(card).toBeInTheDocument()
  })

  test('支持自定义className', () => {
    render(<Card className="custom-card-class" />)

    const card = document.querySelector('.relative')
    expect(card).toHaveClass('custom-card-class')
  })

  test('正确应用边框样式', () => {
    const { rerender } = render(<Card border="none" data-testid="card" />)
    expect(screen.getByTestId('card')).not.toHaveClass('border')

    rerender(<Card border="light" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('border', 'border-gray-200')

    rerender(<Card border="medium" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('border', 'border-gray-300')

    rerender(<Card border="strong" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('border-2', 'border-gray-400')
  })

  test('正确应用圆角样式', () => {
    const { rerender } = render(<Card rounded="none" data-testid="card" />)
    expect(screen.getByTestId('card')).not.toHaveClass('rounded')

    rerender(<Card rounded="small" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('rounded-sm')

    rerender(<Card rounded="medium" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('rounded-md')

    rerender(<Card rounded="large" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('rounded-lg')
  })

  test('正确应用阴影样式', () => {
    const { rerender } = render(<Card shadow="none" data-testid="card" />)
    expect(screen.getByTestId('card')).not.toHaveClass('shadow')

    rerender(<Card shadow="small" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('shadow-sm')

    rerender(<Card shadow="medium" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('shadow-md')

    rerender(<Card shadow="large" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('shadow-lg')
  })

  test('正确应用内边距样式', () => {
    const { rerender } = render(<Card padding="none" data-testid="card" />)
    expect(screen.getByTestId('card')).not.toHaveClass('p-')

    rerender(<Card padding="small" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('p-3')

    rerender(<Card padding="medium" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('p-4')

    rerender(<Card padding="large" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('p-6')
  })

  test('渲染子元素', () => {
    render(
      <Card>
        <h3>卡片标题</h3>
        <p>卡片内容</p>
      </Card>
    )

    expect(screen.getByText('卡片标题')).toBeInTheDocument()
    expect(screen.getByText('卡片内容')).toBeInTheDocument()
  })

  test('卡片渲染子元素正确', () => {
    render(
      <Card>
        <h3>卡片标题</h3>
        <p>卡片内容</p>
      </Card>
    )

    expect(screen.getByText('卡片标题')).toBeInTheDocument()
    expect(screen.getByText('卡片内容')).toBeInTheDocument()
  })
})
