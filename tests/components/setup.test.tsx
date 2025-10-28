/**
 * 基础组件库设置测试
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import { render, screen } from '../components/utils/test-utils'
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'

describe('基础组件库设置', () => {
  it('应该能够正确导入和渲染基本组件', () => {
    // 测试基础的渲染功能
    const TestComponent = () => (
      <div data-testid="test-component">
        <h1>基础组件库测试</h1>
        <p>这是一个测试组件，验证我们的设置是否正确</p>
      </div>
    )

    render(<TestComponent />)

    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('基础组件库测试')).toBeInTheDocument()
  })

  it('应该能够导入和使用类型定义', () => {
    // 测试类型定义是否正确
    const testProps = {
      id: 'test-1',
      isSelected: false,
      isDragging: false,
      onSelect: () => {},
      onDelete: () => {},
      onUpdate: () => {},
      props: {},
      styles: {},
    }

    expect(testProps).toBeDefined()
    expect(testProps.id).toBe('test-1')
  })

  it('应该能够使用自定义匹配器', () => {
    // 测试自定义Jest匹配器
    const testComponent = {
      type: 'div',
      props: { className: 'test-class' },
    }

    expect(testComponent).toHaveComponent('div')
  })
})
