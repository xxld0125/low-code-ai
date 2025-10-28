/**
 * 向后兼容性测试
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import { render, screen } from '../components/utils/test-utils'
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'

// 测试向后兼容的导入
import { PageButton, PageButtonPreview } from '@/components/lowcode/page-basic'
import { PageInput, PageInputPreview } from '@/components/lowcode/page-basic'
import { PageText, PageTextPreview } from '@/components/lowcode/page-basic'
import { PageImage, PageImagePreview } from '@/components/lowcode/page-basic'
import { PageContainer, PageContainerPreview } from '@/components/lowcode/page-layout'
import { PageRow, PageRowPreview } from '@/components/lowcode/page-layout'
import { PageCol, PageColPreview } from '@/components/lowcode/page-layout'

describe('向后兼容性测试', () => {
  describe('基础组件兼容性', () => {
    it('应该能够通过旧路径导入PageButton组件', () => {
      expect(PageButton).toBeDefined()
      expect(PageButtonPreview).toBeDefined()
      render(<PageButtonPreview />)
      expect(screen.getByText('按钮')).toBeInTheDocument()
    })

    it('应该能够通过旧路径导入PageInput组件', () => {
      expect(PageInput).toBeDefined()
      expect(PageInputPreview).toBeDefined()
      render(<PageInputPreview />)
      expect(screen.getByPlaceholderText('输入框')).toBeInTheDocument()
    })

    it('应该能够通过旧路径导入PageText组件', () => {
      expect(PageText).toBeDefined()
      expect(PageTextPreview).toBeDefined()
      render(<PageTextPreview />)
      expect(screen.getByText('文本')).toBeInTheDocument()
    })

    it('应该能够通过旧路径导入PageImage组件', () => {
      expect(PageImage).toBeDefined()
      expect(PageImagePreview).toBeDefined()
      render(<PageImagePreview />)
      expect(screen.getByText('图片')).toBeInTheDocument()
    })
  })

  describe('布局组件兼容性', () => {
    it('应该能够通过旧路径导入PageContainer组件', () => {
      expect(PageContainer).toBeDefined()
      expect(PageContainerPreview).toBeDefined()
    })

    it('应该能够通过旧路径导入PageRow组件', () => {
      expect(PageRow).toBeDefined()
      expect(PageRowPreview).toBeDefined()
    })

    it('应该能够通过旧路径导入PageCol组件', () => {
      expect(PageCol).toBeDefined()
      expect(PageColPreview).toBeDefined()
    })
  })
})
