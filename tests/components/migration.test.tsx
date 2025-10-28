/**
 * 组件库迁移测试
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import { render, screen } from '../components/utils/test-utils'
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'

// 测试组件导入
import { Button, ButtonPreview } from '@/components/lowcode/basic/Button'
import { Input, InputPreview } from '@/components/lowcode/basic/Input'
import { Text, TextPreview } from '@/components/lowcode/display/Text'
import { Image, ImagePreview } from '@/components/lowcode/display/Image'
import { Container, ContainerPreview } from '@/components/lowcode/layout/Container'
import { Row, RowPreview } from '@/components/lowcode/layout/Row'
import { Col, ColPreview } from '@/components/lowcode/layout/Col'

describe('组件库迁移测试', () => {
  describe('基础表单组件', () => {
    it('应该能够导入和使用Button组件', () => {
      expect(Button).toBeDefined()
      expect(ButtonPreview).toBeDefined()
    })

    it('应该能够导入和使用Input组件', () => {
      expect(Input).toBeDefined()
      expect(InputPreview).toBeDefined()
    })
  })

  describe('展示组件', () => {
    it('应该能够导入和使用Text组件', () => {
      expect(Text).toBeDefined()
      expect(TextPreview).toBeDefined()
    })

    it('应该能够导入和使用Image组件', () => {
      expect(Image).toBeDefined()
      expect(ImagePreview).toBeDefined()
    })
  })

  describe('布局组件', () => {
    it('应该能够导入和使用Container组件', () => {
      expect(Container).toBeDefined()
      expect(ContainerPreview).toBeDefined()
    })

    it('应该能够导入和使用Row组件', () => {
      expect(Row).toBeDefined()
      expect(RowPreview).toBeDefined()
    })

    it('应该能够导入和使用Col组件', () => {
      expect(Col).toBeDefined()
      expect(ColPreview).toBeDefined()
    })
  })

  describe('组件渲染测试', () => {
    it('应该能够渲染Button预览组件', () => {
      render(<ButtonPreview />)
      expect(screen.getByText('按钮')).toBeInTheDocument()
    })

    it('应该能够渲染Input预览组件', () => {
      render(<InputPreview />)
      expect(screen.getByPlaceholderText('输入框')).toBeInTheDocument()
    })

    it('应该能够渲染Text预览组件', () => {
      render(<TextPreview />)
      expect(screen.getByText('文本')).toBeInTheDocument()
    })

    it('应该能够渲染Image预览组件', () => {
      render(<ImagePreview />)
      expect(screen.getByText('图片')).toBeInTheDocument()
    })

    it('应该能够渲染Container预览组件', () => {
      render(<ContainerPreview />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('应该能够渲染Row预览组件', () => {
      render(<RowPreview />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('应该能够渲染Col预览组件', () => {
      render(<ColPreview />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
