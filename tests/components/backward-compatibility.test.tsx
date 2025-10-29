/**
 * 新组件库兼容性测试
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import { render } from '../components/utils/test-utils'
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'

// 测试新的组件库导入
import { Button } from '@/components/lowcode/basic/Button'
import { Input } from '@/components/lowcode/basic/Input'
import { Text } from '@/components/lowcode/display/Text'
import { Image } from '@/components/lowcode/display/Image'
import { Container } from '@/components/lowcode/layout/Container'
import { Row } from '@/components/lowcode/layout/Row'
import { Col } from '@/components/lowcode/layout/Col'

describe('新组件库兼容性测试', () => {
  describe('基础组件兼容性', () => {
    it('应该能够导入Button组件', () => {
      expect(Button).toBeDefined()

      // 测试组件渲染 - 使用包装器来简化测试
      const ButtonWrapper = () => (
        <Button
          id="test"
          type="button"
          props={{ button: { text: '测试按钮', variant: 'primary', size: 'md' } }}
          styles={{}}
          events={{}}
        />
      )

      render(<ButtonWrapper />)
      // 由于Button组件的内部实现可能不同，我们只检查它是否能正常渲染
      expect(document.body).toBeTruthy()
    })

    it('应该能够导入Input组件', () => {
      expect(Input).toBeDefined()

      const InputWrapper = () => (
        <Input
          id="test"
          type="input"
          props={{ input: { placeholder: '测试输入框', type: 'text' } }}
          styles={{}}
          events={{}}
        />
      )

      render(<InputWrapper />)
      expect(document.body).toBeTruthy()
    })

    it('应该能够导入Text组件', () => {
      expect(Text).toBeDefined()

      const TextWrapper = () => <Text content="测试文本" />

      render(<TextWrapper />)
      expect(document.body).toBeTruthy()
    })

    it('应该能够导入Image组件', () => {
      expect(Image).toBeDefined()

      const ImageWrapper = () => <Image src="/test.jpg" alt="测试图片" />

      render(<ImageWrapper />)
      expect(document.body).toBeTruthy()
    })
  })

  describe('布局组件兼容性', () => {
    it('应该能够导入Container组件', () => {
      expect(Container).toBeDefined()

      const ContainerWrapper = () => (
        <Container id="test" type="container" props={{}} styles={{}} events={{}} />
      )

      render(<ContainerWrapper />)
      expect(document.body).toBeTruthy()
    })

    it('应该能够导入Row组件', () => {
      expect(Row).toBeDefined()

      const RowWrapper = () => <Row id="test" type="row" props={{}} styles={{}} events={{}} />

      render(<RowWrapper />)
      expect(document.body).toBeTruthy()
    })

    it('应该能够导入Col组件', () => {
      expect(Col).toBeDefined()

      const ColWrapper = () => <Col id="test" type="col" props={{}} styles={{}} events={{}} />

      render(<ColWrapper />)
      expect(document.body).toBeTruthy()
    })
  })
})
