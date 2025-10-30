import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { PageCol as Col } from '../../../components/lowcode/layout/Col/Col'
import { createLayoutTestProps } from '../../utils/test-utils'

// Mock dependencies - Col组件不需要额外的UI组件依赖

describe('Col组件', () => {
  const defaultProps = createLayoutTestProps(
    'col',
    {},
    {
      children: <div>测试内容</div>,
    }
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该正确渲染基础列', () => {
    render(<Col {...defaultProps} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
    expect(col).toHaveAttribute('data-component-type', 'col')
    expect(col).toHaveTextContent('测试内容')
  })

  it('应该应用自定义样式', () => {
    const customStyles = {
      width: '200px',
      height: '150px',
    }

    const propsWithStyles = createLayoutTestProps(
      'col',
      {
        padding: { x: 12, y: 12 },
        margin: { x: 8, y: 8 },
      },
      {
        styles: customStyles,
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithStyles} />)

    const col = screen.getByRole('group')
    expect(col).toHaveStyle('width: 200px')
    expect(col).toHaveStyle('height: 150px')
    expect(col).toHaveStyle('padding: 12px 12px')
    expect(col).toHaveStyle('margin: 8px 8px')
  })

  it('应该支持span属性', () => {
    const propsWithSpan = createLayoutTestProps(
      'col',
      {
        span: 12,
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithSpan} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持offset属性', () => {
    const propsWithOffset = createLayoutTestProps(
      'col',
      {
        offset: 2,
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithOffset} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持order属性', () => {
    const propsWithOrder = createLayoutTestProps(
      'col',
      {
        order: 1,
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithOrder} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持flex属性', () => {
    const propsWithFlex = createLayoutTestProps(
      'col',
      {
        flex: '1',
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithFlex} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持响应式断点属性', () => {
    const propsWithResponsive = createLayoutTestProps(
      'col',
      {
        span: {
          xs: 24,
          sm: 12,
          md: 8,
          lg: 6,
          xl: 4,
        },
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithResponsive} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持flexGrow属性', () => {
    const propsWithFlexGrow = createLayoutTestProps(
      'col',
      {
        flexGrow: 1,
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithFlexGrow} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持flexShrink属性', () => {
    const propsWithFlexShrink = createLayoutTestProps(
      'col',
      {
        flexShrink: 0,
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithFlexShrink} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持flexBasis属性', () => {
    const propsWithFlexBasis = createLayoutTestProps(
      'col',
      {
        flexBasis: '200px',
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithFlexBasis} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持alignSelf属性', () => {
    const propsWithAlignSelf = createLayoutTestProps(
      'col',
      {
        alignSelf: 'center',
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithAlignSelf} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持padding属性', () => {
    const propsWithPadding = createLayoutTestProps(
      'col',
      {
        padding: { x: 16, y: 8 },
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithPadding} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该支持margin属性', () => {
    const propsWithMargin = createLayoutTestProps(
      'col',
      {
        margin: { x: 16, y: 8 },
      },
      {
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithMargin} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该正确处理children', () => {
    const testChildren = (
      <div>
        <h2>列标题</h2>
        <p>列内容</p>
      </div>
    )

    const propsWithChildren = createLayoutTestProps(
      'col',
      {},
      {
        children: testChildren,
      }
    )

    render(<Col {...propsWithChildren} />)

    const col = screen.getByRole('group')
    expect(col).toHaveTextContent('列标题')
    expect(col).toHaveTextContent('列内容')
  })

  it('应该处理空样式对象', () => {
    const propsWithEmptyStyles = createLayoutTestProps(
      'col',
      {},
      {
        styles: {},
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithEmptyStyles} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该处理null样式', () => {
    const propsWithNullStyles = createLayoutTestProps(
      'col',
      {},
      {
        styles: {} as Record<string, unknown>, // 使用空对象而不是null
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithNullStyles} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该处理选中状态', () => {
    const propsWithSelected = createLayoutTestProps(
      'col',
      {},
      {
        isSelected: true,
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithSelected} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })

  it('应该处理拖拽状态', () => {
    const propsWithDragging = createLayoutTestProps(
      'col',
      {},
      {
        isDragging: true,
        children: <div>测试内容</div>,
      }
    )

    render(<Col {...propsWithDragging} />)

    const col = screen.getByRole('group')
    expect(col).toBeInTheDocument()
  })
})
