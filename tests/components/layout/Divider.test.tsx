import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { Divider } from '../../../components/lowcode/layout/Divider/Divider'
import { createLayoutTestProps } from '../../utils/test-utils'

// Mock dependencies - Divider组件不需要额外的UI组件依赖

describe('Divider组件', () => {
  const defaultProps = createLayoutTestProps('divider', {}, {
    'data-testid': 'divider',
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该正确渲染基础分隔线', () => {
    render(<Divider {...defaultProps} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toBeInTheDocument()
  })

  it('应该应用自定义样式', () => {
    const customStyles = {
      borderColor: '#d9d9d9',
      borderWidth: '2px',
      margin: '16px 0',
    }

    const propsWithStyles = createLayoutTestProps('divider', {}, {
      styles: customStyles,
    })

    render(<Divider {...propsWithStyles} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toHaveStyle({
      borderColor: '#d9d9d9',
      borderWidth: '2px',
      margin: '16px 0',
    })
  })

  it('应该应用自定义类名', () => {
    const propsWithClassName = createLayoutTestProps('divider', {}, {
      className: 'custom-divider-class',
    })

    render(<Divider {...propsWithClassName} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toHaveClass('custom-divider-class')
  })

  it('应该支持水平方向', () => {
    const propsWithOrientation = createLayoutTestProps('divider', {
      orientation: 'horizontal',
    })

    render(<Divider {...propsWithOrientation} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('应该支持垂直方向', () => {
    const propsWithVertical = createLayoutTestProps('divider', {
      orientation: 'vertical',
    })

    render(<Divider {...propsWithVertical} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toHaveAttribute('data-orientation', 'vertical')
  })

  it('应该支持带文本的分隔线', () => {
    const propsWithText = createLayoutTestProps('divider', {}, {
      children: '分隔文本',
    })

    render(<Divider {...propsWithText} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toHaveTextContent('分隔文本')
  })

  it('应该支持dashed样式', () => {
    const propsWithDashed = createLayoutTestProps('divider', {
      dashed: true,
    })

    render(<Divider {...propsWithDashed} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toBeInTheDocument()
  })

  it('应该支持plain样式', () => {
    const propsWithPlain = createLayoutTestProps('divider', {
      plain: true,
    }, {
      children: '纯文本',
    })

    render(<Divider {...propsWithPlain} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveTextContent('纯文本')
  })

  it('应该支持自定义文本内容', () => {
    const customText = '自定义分隔内容'
    const propsWithCustomText = createLayoutTestProps('divider', {}, {
      children: customText,
    })

    render(<Divider {...propsWithCustomText} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toHaveTextContent(customText)
  })

  it('应该支持复杂children内容', () => {
    const complexChildren = (
      <div>
        <span>图标</span>
        <span>文本</span>
      </div>
    )

    const propsWithComplexChildren = createLayoutTestProps('divider', {}, {
      children: complexChildren,
    })

    render(<Divider {...propsWithComplexChildren} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toHaveTextContent('图标')
    expect(divider).toHaveTextContent('文本')
  })

  it('应该支持其他HTML属性', () => {
    const propsWithCustomAttributes = createLayoutTestProps('divider', {}, {
      'data-testid': 'custom-test-id',
      role: 'separator',
    })

    render(<Divider {...propsWithCustomAttributes} />)

    const divider = screen.getByRole('separator')
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveAttribute('data-testid', 'custom-test-id')
  })

  it('应该处理空样式对象', () => {
    const propsWithEmptyStyles = createLayoutTestProps('divider', {}, {
      styles: {},
    })

    render(<Divider {...propsWithEmptyStyles} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toBeInTheDocument()
  })

  it('应该处理null样式', () => {
    const propsWithNullStyles = createLayoutTestProps('divider', {}, {
      styles: null as unknown as any,
    })

    render(<Divider {...propsWithNullStyles} />)

    const divider = screen.getByTestId('divider')
    expect(divider).toBeInTheDocument()
  })
})