import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { PageRow as Row } from '../../../components/lowcode/layout/Row/Row'
import { createLayoutTestProps } from '../../utils/test-utils'

// Mock dependencies - Row组件不需要额外的UI组件依赖

describe('Row组件', () => {
  const defaultProps = createLayoutTestProps('row', {}, {
    'data-testid': 'row',
    children: <div>测试内容</div>,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该正确渲染基础行', () => {
    render(<Row {...defaultProps} />)

    const row = screen.getByTestId('row')
    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('测试内容')
  })

  it('应该应用自定义样式', () => {
    const customStyles = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }

    const propsWithStyles = createLayoutTestProps('row', {}, {
      styles: customStyles,
      children: <div>测试内容</div>,
    })

    render(<Row {...propsWithStyles} />)

    const row = screen.getByTestId('row')
    expect(row).toHaveStyle({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    })
  })

  it('应该应用自定义类名', () => {
    const propsWithClassName = createLayoutTestProps('row', {}, {
      className: 'custom-row-class',
      children: <div>测试内容</div>,
    })

    render(<Row {...propsWithClassName} />)

    const row = screen.getByTestId('row')
    expect(row).toHaveClass('custom-row-class')
  })

  it('应该支持gutter属性', () => {
    const propsWithGutter = createLayoutTestProps('row', {
      gutter: 16,
    }, {
      children: <div>测试内容</div>,
    })

    render(<Row {...propsWithGutter} />)

    const row = screen.getByTestId('row')
    expect(row).toBeInTheDocument()
  })

  it('应该支持justify属性', () => {
    const propsWithJustify = createLayoutTestProps('row', {
      justify: 'center',
    }, {
      children: <div>测试内容</div>,
    })

    render(<Row {...propsWithJustify} />)

    const row = screen.getByTestId('row')
    expect(row).toBeInTheDocument()
  })

  it('应该支持align属性', () => {
    const propsWithAlign = createLayoutTestProps('row', {
      align: 'middle',
    }, {
      children: <div>测试内容</div>,
    })

    render(<Row {...propsWithAlign} />)

    const row = screen.getByTestId('row')
    expect(row).toBeInTheDocument()
  })

  it('应该支持wrap属性', () => {
    const propsWithWrap = createLayoutTestProps('row', {
      wrap: true,
    }, {
      children: <div>测试内容</div>,
    })

    render(<Row {...propsWithWrap} />)

    const row = screen.getByTestId('row')
    expect(row).toBeInTheDocument()
  })

  it('应该正确处理多个children', () => {
    const testChildren = [
      <div key="1">子元素1</div>,
      <div key="2">子元素2</div>,
      <div key="3">子元素3</div>,
    ]

    const propsWithMultipleChildren = createLayoutTestProps('row', {}, {
      children: testChildren,
    })

    render(<Row {...propsWithMultipleChildren} />)

    const row = screen.getByTestId('row')
    expect(row).toHaveTextContent('子元素1')
    expect(row).toHaveTextContent('子元素2')
    expect(row).toHaveTextContent('子元素3')
  })

  it('应该支持其他HTML属性', () => {
    const propsWithCustomAttributes = createLayoutTestProps('row', {}, {
      'data-testid': 'custom-test-id',
      role: 'row',
      children: <div>测试内容</div>,
    })

    render(<Row {...propsWithCustomAttributes} />)

    const row = screen.getByRole('row')
    expect(row).toBeInTheDocument()
    expect(row).toHaveAttribute('data-testid', 'custom-test-id')
  })

  it('应该处理空样式对象', () => {
    const propsWithEmptyStyles = createLayoutTestProps('row', {}, {
      styles: {},
      children: <div>测试内容</div>,
    })

    render(<Row {...propsWithEmptyStyles} />)

    const row = screen.getByTestId('row')
    expect(row).toBeInTheDocument()
  })
})