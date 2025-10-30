import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { PageContainer as Container } from '../../../components/lowcode/layout/Container/Container'
import { createLayoutTestProps } from '../../utils/test-utils'

// Mock dependencies - Container组件不需要额外的UI组件依赖

describe('Container组件', () => {
  const defaultProps = createLayoutTestProps(
    'container',
    {
      direction: 'column',
      wrap: false,
      justify: 'start',
      align: 'start',
      gap: 0,
      padding: { x: 0, y: 0 },
      margin: { x: 0, y: 0 },
      background: null,
      border: false,
      shadow: false,
      rounded: false,
    },
    {
      'data-testid': 'container',
      children: <div>测试内容</div>,
    }
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该正确渲染基础容器', () => {
    render(<Container {...defaultProps} />)

    const container = screen.getByRole('group')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('data-component-type', 'container')
    expect(container).toHaveTextContent('测试内容')
  })

  it('应该应用自定义样式', () => {
    const customStyles = {
      width: '300px',
      height: '200px',
    }

    const propsWithStyles = createLayoutTestProps(
      'container',
      {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 16, y: 16 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
      },
      {
        styles: customStyles,
        children: <div>测试内容</div>,
      }
    )

    render(<Container {...propsWithStyles} />)

    const container = screen.getByRole('group')
    expect(container).toHaveStyle('width: 300px')
    expect(container).toHaveStyle('height: 200px')
    expect(container).toHaveStyle('padding: 16px 16px')
  })

  it('应该应用自定义类名', () => {
    const propsWithClassName = createLayoutTestProps(
      'container',
      {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
      },
      {
        className: 'custom-container-class',
        children: <div>测试内容</div>,
      }
    )

    render(<Container {...propsWithClassName} />)

    const container = screen.getByRole('group')
    expect(container).toHaveClass('custom-container-class')
  })

  it('应该支持fluid布局', () => {
    const propsWithFluid = createLayoutTestProps(
      'container',
      {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
        fluid: true,
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Container {...propsWithFluid} />)

    const container = screen.getByRole('group')
    expect(container).toBeInTheDocument()
  })

  it('应该支持maxWidth属性', () => {
    const propsWithMaxWidth = createLayoutTestProps(
      'container',
      {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
        maxWidth: 'md',
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Container {...propsWithMaxWidth} />)

    const container = screen.getByRole('group')
    expect(container).toBeInTheDocument()
  })

  it('应该正确处理children', () => {
    const testChildren = (
      <div>
        <h1>标题</h1>
        <p>段落内容</p>
      </div>
    )

    const propsWithChildren = createLayoutTestProps(
      'container',
      {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
      },
      {
        children: testChildren,
      }
    )

    render(<Container {...propsWithChildren} />)

    const container = screen.getByRole('group')
    expect(container).toHaveTextContent('标题')
    expect(container).toHaveTextContent('段落内容')
  })

  it('应该支持其他HTML属性', () => {
    const propsWithCustomAttributes = createLayoutTestProps(
      'container',
      {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
      },
      {
        'data-testid': 'custom-test-id',
        role: 'main',
        children: <div>测试内容</div>,
      }
    )

    render(<Container {...propsWithCustomAttributes} />)

    const container = screen.getByRole('main')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('data-testid', 'custom-test-id')
  })

  it('应该处理空样式对象', () => {
    const propsWithEmptyStyles = createLayoutTestProps(
      'container',
      {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
      },
      {
        styles: {},
        children: <div>测试内容</div>,
      }
    )

    render(<Container {...propsWithEmptyStyles} />)

    const container = screen.getByRole('group')
    expect(container).toBeInTheDocument()
  })

  it('应该处理null样式', () => {
    const propsWithNullStyles = createLayoutTestProps(
      'container',
      {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
      },
      {
        styles: null as unknown as Record<string, unknown>,
        children: <div>测试内容</div>,
      }
    )

    render(<Container {...propsWithNullStyles} />)

    const container = screen.getByRole('group')
    expect(container).toBeInTheDocument()
  })
})
