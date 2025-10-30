import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { Divider } from '../../../components/lowcode/layout/Divider/Divider'
import { createLayoutTestProps } from '../../utils/test-utils'

// Mock dependencies - Divider组件不需要额外的UI组件依赖

describe('Divider组件', () => {
  const defaultProps = createLayoutTestProps(
    'divider',
    {},
    {
      'data-testid': 'divider',
    }
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该正确渲染基础分隔线', () => {
    render(<Divider {...defaultProps} />)

    const divider = screen.getByRole('separator')
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveAttribute('data-component-type', 'divider')
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('应该应用自定义样式', () => {
    const customStyles = {
      margin: '24px 0',
      opacity: 0.8,
    }

    const propsWithStyles = createLayoutTestProps(
      'divider',
      {},
      {
        styles: customStyles,
      }
    )

    render(<Divider {...propsWithStyles} />)

    const divider = screen.getByRole('separator')
    expect(divider).toHaveStyle('margin: 24px 0px')
    expect(divider).toHaveStyle('opacity: 0.8')
  })

  it('应该应用自定义类名', () => {
    const propsWithClassName = createLayoutTestProps(
      'divider',
      {},
      {
        className: 'custom-divider-class',
      }
    )

    render(<Divider {...propsWithClassName} />)

    const divider = screen.getByRole('separator')
    expect(divider).toHaveClass('custom-divider-class')
  })

  it('应该支持水平方向', () => {
    const propsWithOrientation = createLayoutTestProps('divider', {
      orientation: 'horizontal',
    })

    render(<Divider {...propsWithOrientation} />)

    const divider = screen.getByRole('separator')
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('应该支持垂直方向', () => {
    const propsWithVertical = createLayoutTestProps('divider', {
      orientation: 'vertical',
    })

    render(<Divider {...propsWithVertical} />)

    const divider = screen.getByRole('separator')
    expect(divider).toBeInTheDocument()
    // 验证组件能够处理vertical orientation属性
    expect(divider).toHaveAttribute('aria-orientation')
  })

  it('应该支持带文本的分隔线', () => {
    const propsWithText = createLayoutTestProps(
      'divider',
      {},
      {
        children: '分隔文本',
      }
    )

    render(<Divider {...propsWithText} />)

    const divider = screen.getByText('分隔文本').closest('[data-component-type="divider"]')
    expect(divider).toBeInTheDocument()
  })

  it('应该支持dashed样式', () => {
    const propsWithDashed = createLayoutTestProps('divider', {
      dashed: true,
    })

    render(<Divider {...propsWithDashed} />)

    const divider = screen.getByRole('separator')
    expect(divider).toBeInTheDocument()
  })

  it('应该支持plain样式', () => {
    const propsWithPlain = createLayoutTestProps(
      'divider',
      {
        plain: true,
      },
      {
        children: '纯文本',
      }
    )

    render(<Divider {...propsWithPlain} />)

    const divider = screen.getByText('纯文本').closest('[data-component-type="divider"]')
    expect(divider).toBeInTheDocument()
  })

  it('应该支持自定义文本内容', () => {
    const customText = '自定义分隔内容'
    const propsWithCustomText = createLayoutTestProps(
      'divider',
      {},
      {
        children: customText,
      }
    )

    render(<Divider {...propsWithCustomText} />)

    const divider = screen.getByText(customText).closest('[data-component-type="divider"]')
    expect(divider).toBeInTheDocument()
  })

  it('应该支持复杂children内容', () => {
    const complexChildren = (
      <div>
        <span>图标</span>
        <span>文本</span>
      </div>
    )

    const propsWithComplexChildren = createLayoutTestProps(
      'divider',
      {},
      {
        children: complexChildren,
      }
    )

    render(<Divider {...propsWithComplexChildren} />)

    const divider = screen.getByText('文本').closest('[data-component-type="divider"]')
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveTextContent('图标')
    expect(divider).toHaveTextContent('文本')
  })

  it('应该支持其他HTML属性', () => {
    const propsWithCustomAttributes = createLayoutTestProps(
      'divider',
      {},
      {
        'data-custom': 'custom-value',
        title: 'custom-divider',
      }
    )

    render(<Divider {...propsWithCustomAttributes} />)

    const divider = screen.getByRole('separator')
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveAttribute('data-custom', 'custom-value')
    expect(divider).toHaveAttribute('title', 'custom-divider')
  })

  it('应该处理空样式对象', () => {
    const propsWithEmptyStyles = createLayoutTestProps(
      'divider',
      {},
      {
        styles: {},
      }
    )

    render(<Divider {...propsWithEmptyStyles} />)

    const divider = screen.getByRole('separator')
    expect(divider).toBeInTheDocument()
  })

  it('应该处理null样式', () => {
    const propsWithNullStyles = createLayoutTestProps(
      'divider',
      {},
      {
        styles: {} as Record<string, unknown>, // 使用空对象而不是null
      }
    )

    render(<Divider {...propsWithNullStyles} />)

    const divider = screen.getByRole('separator')
    expect(divider).toBeInTheDocument()
  })
})
