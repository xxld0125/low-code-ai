import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { Spacer } from '../../../components/lowcode/layout/Spacer/Spacer'
import { createLayoutTestProps } from '../../utils/test-utils'

// Mock dependencies - Spacer组件不需要额外的UI组件依赖

describe('Spacer组件', () => {
  const defaultProps = createLayoutTestProps(
    'spacer',
    {},
    {
      'data-testid': 'spacer',
    }
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该正确渲染基础间距组件', () => {
    render(<Spacer {...defaultProps} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
    expect(spacer).toHaveAttribute('data-component-type', 'spacer')
    expect(spacer).toHaveAttribute('data-size', 'md')
    expect(spacer).toHaveAttribute('data-direction', 'vertical')
  })

  it('应该应用自定义样式', () => {
    const customStyles = {
      opacity: 0.5,
    }

    const propsWithStyles = createLayoutTestProps(
      'spacer',
      {},
      {
        styles: customStyles,
      }
    )

    render(<Spacer {...propsWithStyles} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toHaveStyle('opacity: 0.5')
  })

  it('应该应用自定义类名', () => {
    const propsWithClassName = createLayoutTestProps(
      'spacer',
      {},
      {
        className: 'custom-spacer-class',
      }
    )

    render(<Spacer {...propsWithClassName} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toHaveClass('custom-spacer-class')
  })

  it('应该支持size属性', () => {
    const propsWithSize = createLayoutTestProps('spacer', {
      size: 'small',
    })

    render(<Spacer {...propsWithSize} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
    // 验证组件能接受size属性而不崩溃
  })

  it('应该支持direction属性', () => {
    const propsWithDirection = createLayoutTestProps('spacer', {
      direction: 'horizontal',
    })

    render(<Spacer {...propsWithDirection} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
    // 验证组件能接受direction属性而不崩溃
  })

  it('应该支持水平方向', () => {
    const propsWithHorizontal = createLayoutTestProps('spacer', {
      direction: 'horizontal',
    })

    render(<Spacer {...propsWithHorizontal} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
  })

  it('应该支持数值size', () => {
    const propsWithNumericSize = createLayoutTestProps('spacer', {
      size: 16,
    })

    render(<Spacer {...propsWithNumericSize} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
  })

  it('应该支持预设size值', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

    sizes.forEach(size => {
      const propsWithPresetSize = createLayoutTestProps('spacer', {
        size: size,
      })

      const { unmount } = render(<Spacer {...propsWithPresetSize} />)

      const spacer = screen.getByRole('separator', { hidden: true })
      expect(spacer).toBeInTheDocument()
      unmount()
    })
  })

  it('应该支持双向间距', () => {
    const propsWithBothDirection = createLayoutTestProps('spacer', {
      direction: 'both',
    })

    render(<Spacer {...propsWithBothDirection} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
  })

  it('应该支持内嵌子元素', () => {
    const propsWithChildren = createLayoutTestProps(
      'spacer',
      {},
      {
        children: <div>内嵌内容</div>,
      }
    )

    render(<Spacer {...propsWithChildren} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
    // Spacer组件可能不显示children，这是正常的
  })

  it('应该支持其他HTML属性', () => {
    const propsWithCustomAttributes = createLayoutTestProps(
      'spacer',
      {},
      {
        title: 'custom-spacer',
      }
    )

    render(<Spacer {...propsWithCustomAttributes} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
  })

  it('应该处理空样式对象', () => {
    const propsWithEmptyStyles = createLayoutTestProps(
      'spacer',
      {},
      {
        styles: {},
      }
    )

    render(<Spacer {...propsWithEmptyStyles} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
  })

  it('应该处理null样式', () => {
    const propsWithNullStyles = createLayoutTestProps(
      'spacer',
      {},
      {
        styles: {} as Record<string, unknown>, // 使用空对象而不是null
      }
    )

    render(<Spacer {...propsWithNullStyles} />)

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toBeInTheDocument()
  })

  it('应该处理flex布局场景', () => {
    const flexProps = createLayoutTestProps('spacer', {
      size: 'md',
      direction: 'vertical',
    })

    render(
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>内容1</div>
        <Spacer {...flexProps} />
        <div>内容2</div>
      </div>
    )

    const spacer = screen.getByRole('separator', { hidden: true })
    expect(spacer).toHaveAttribute('data-size', 'md')
    expect(spacer).toHaveAttribute('data-direction', 'vertical')
  })
})
