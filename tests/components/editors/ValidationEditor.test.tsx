/**
 * ValidationEditor 组件测试
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-31
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ValidationEditor } from '../../../components/lowcode/editors/ValidationEditor'

// Mock field definition
const mockField = {
  key: 'username',
  type: 'string' as const,
  label: '用户名',
  required: false,
  default: '',
  group: 'basic',
  order: 1,
}

// Mock validation rules
const mockRules = [
  {
    id: 'required_1',
    type: 'required' as const,
    enabled: true,
    errorMessage: '用户名不能为空',
    description: '必填验证',
  },
  {
    id: 'minLength_1',
    type: 'minLength' as const,
    value: 3,
    enabled: true,
    errorMessage: '用户名至少需要3个字符',
    description: '最小长度验证',
  },
  {
    id: 'maxLength_1',
    type: 'maxLength' as const,
    value: 20,
    enabled: true,
    errorMessage: '用户名最多20个字符',
    description: '最大长度验证',
  },
]

describe('ValidationEditor', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染ValidationEditor组件', () => {
      const mockOnRulesChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          onRulesChange={mockOnRulesChange}
        />
      )

      expect(screen.getByText('验证规则配置')).toBeInTheDocument()
      expect(screen.getByText('用户名')).toBeInTheDocument()
    })

    it('应该显示规则数量标签', () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
        />
      )

      const badge = screen.getByText('3/3 已启用')
      expect(badge).toBeInTheDocument()
    })

    it('应该显示所有工具按钮', () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
        />
      )

      expect(screen.getByText('重置')).toBeInTheDocument()
      expect(screen.getByText('复制')).toBeInTheDocument()
      expect(screen.getByText('导出')).toBeInTheDocument()
    })

    it('应该显示加载状态', () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          loading={true}
        />
      )

      expect(screen.getByText('加载验证编辑器...')).toBeInTheDocument()
    })
  })

  describe('验证规则管理', () => {
    it('应该显示所有验证规则', () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
        />
      )

      expect(screen.getByText('必填验证')).toBeInTheDocument()
      expect(screen.getByText('最小长度验证')).toBeInTheDocument()
      expect(screen.getByText('最大长度验证')).toBeInTheDocument()
    })

    it('应该支持切换规则启用状态', async () => {
      const mockOnRulesChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          onRulesChange={mockOnRulesChange}
        />
      )

      const switches = screen.getAllByRole('switch')
      expect(switches).toHaveLength(3)

      // 禁用第一个规则
      await user.click(switches[0])

      expect(mockOnRulesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'required_1',
            enabled: false,
          }),
        ])
      )
    })

    it('应该支持编辑规则参数', async () => {
      const mockOnRulesChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          onRulesChange={mockOnRulesChange}
        />
      )

      const minLengthInputs = screen.getAllByDisplayValue('3')
      expect(minLengthInputs).toHaveLength(1)

      // 修改最小长度
      await user.clear(minLengthInputs[0])
      await user.type(minLengthInputs[0], '5')

      expect(mockOnRulesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'minLength_1',
            value: 5,
          }),
        ])
      )
    })

    it('应该支持编辑错误消息', async () => {
      const mockOnRulesChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          onRulesChange={mockOnRulesChange}
        />
      )

      const errorInputs = screen.getAllByDisplayValue('用户名至少需要3个字符')
      expect(errorInputs).toHaveLength(1)

      // 修改错误消息
      await user.clear(errorInputs[0])
      await user.type(errorInputs[0], '新的错误消息')

      expect(mockOnRulesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'minLength_1',
            errorMessage: '新的错误消息',
          }),
        ])
      )
    })

    it('应该支持删除规则', async () => {
      const mockOnRulesChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          onRulesChange={mockOnRulesChange}
        />
      )

      const deleteButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg')?.getAttribute('data-testid') === 'icon-trash'
      )
      expect(deleteButtons).toHaveLength(3)

      // 删除第一个规则
      await user.click(deleteButtons[0])

      expect(mockOnRulesChange).toHaveBeenCalledWith([
        mockRules[1],
        mockRules[2],
      ])
    })

    it('应该支持添加新规则', async () => {
      const mockOnRulesChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          onRulesChange={mockOnRulesChange}
        />
      )

      // 点击选择器
      const selectTrigger = screen.getByText('选择验证规则类型')
      await user.click(selectTrigger)

      // 选择正则表达式规则
      const patternOption = screen.getByText('正则表达式')
      await user.click(patternOption)

      expect(mockOnRulesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          ...mockRules,
          expect.objectContaining({
            type: 'pattern',
            enabled: true,
          }),
        ])
      )
    })
  })

  describe('预设模板', () => {
    it('应该显示适用于字符串字段的预设', async () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={[]}
          config={{ showPresets: true }}
        />
      )

      // 切换到预设标签页
      const presetsTab = screen.getByText('预设模板')
      await user.click(presetsTab)

      expect(screen.getByText('用户名')).toBeInTheDocument()
      expect(screen.getByText('密码')).toBeInTheDocument()
      expect(screen.getByText('邮箱')).toBeInTheDocument()
    })

    it('应该支持应用预设模板', async () => {
      const mockOnRulesChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={[]}
          config={{ showPresets: true }}
          onRulesChange={mockOnRulesChange}
        />
      )

      // 切换到预设标签页
      const presetsTab = screen.getByText('预设模板')
      await user.click(presetsTab)

      // 应用用户名预设
      const applyButton = screen.getByText('应用')
      await user.click(applyButton)

      expect(mockOnRulesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'required',
          }),
          expect.objectContaining({
            type: 'minLength',
          }),
          expect.objectContaining({
            type: 'maxLength',
          }),
          expect.objectContaining({
            type: 'pattern',
          }),
        ])
      )
    })

    it('应该显示预设规则数量', async () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={[]}
          config={{ showPresets: true }}
        />
      )

      // 切换到预设标签页
      const presetsTab = screen.getByText('预设模板')
      await user.click(presetsTab)

      const badges = screen.getAllByText(/条规则/)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('测试验证', () => {
    it('应该支持测试验证规则', async () => {
      const mockOnValidationChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          config={{ showTestArea: true }}
          onValidationChange={mockOnValidationChange}
        />
      )

      // 切换到测试标签页
      const testTab = screen.getByText('测试验证')
      await user.click(testTab)

      // 输入测试值
      const testInput = screen.getByPlaceholderText('请输入测试值')
      await user.type(testInput, 'ab')

      // 开始验证
      const validateButton = screen.getByText('开始验证')
      await user.click(validateButton)

      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
          })
        )
      })
    })

    it('应该显示验证错误信息', async () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          config={{ showTestArea: true }}
        />
      )

      // 切换到测试标签页
      const testTab = screen.getByText('测试验证')
      await user.click(testTab)

      // 输入测试值（太短）
      const testInput = screen.getByPlaceholderText('请输入测试值')
      await user.type(testInput, 'ab')

      // 开始验证
      const validateButton = screen.getByText('开始验证')
      await user.click(validateButton)

      await waitFor(() => {
        expect(screen.getByText('验证失败')).toBeInTheDocument()
        expect(screen.getByText(/至少需要/)).toBeInTheDocument()
      })
    })

    it('应该显示验证成功信息', async () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          config={{ showTestArea: true }}
        />
      )

      // 切换到测试标签页
      const testTab = screen.getByText('测试验证')
      await user.click(testTab)

      // 输入测试值（符合要求）
      const testInput = screen.getByPlaceholderText('请输入测试值')
      await user.type(testInput, 'validusername')

      // 开始验证
      const validateButton = screen.getByText('开始验证')
      await user.click(validateButton)

      await waitFor(() => {
        expect(screen.getByText('验证通过')).toBeInTheDocument()
      })
    })
  })

  describe('工具功能', () => {
    it('应该支持重置规则', async () => {
      const mockOnRulesChange = jest.fn()

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          onRulesChange={mockOnRulesChange}
        />
      )

      const resetButton = screen.getByText('重置')
      await user.click(resetButton)

      expect(mockOnRulesChange).toHaveBeenCalledWith([])
    })

    it('应该支持复制规则', async () => {
      // Mock clipboard API
      const mockWriteText = jest.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      })

      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
        />
      )

      const copyButton = screen.getByText('复制')
      await user.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('required')
      )
    })

    it('应该在没有规则时禁用复制和导出按钮', () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={[]}
        />
      )

      const copyButton = screen.getByText('复制')
      const exportButton = screen.getByText('导出')

      expect(copyButton).toBeDisabled()
      expect(exportButton).toBeDisabled()
    })
  })

  describe('禁用和只读状态', () => {
    it('应该在禁用时禁用所有交互', () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          disabled={true}
        />
      )

      const switches = screen.getAllByRole('switch')
      const inputs = screen.getAllByRole('textbox')
      const buttons = screen.getAllByRole('button')

      switches.forEach(switch_ => expect(switch_).toBeDisabled())
      inputs.forEach(input => expect(input).toBeDisabled())

      // 工具栏按钮应该被禁用
      expect(screen.getByText('重置')).toBeDisabled()
      expect(screen.getByText('复制')).toBeDisabled()
      expect(screen.getByText('导出')).toBeDisabled()
    })

    it('应该在只读时禁用编辑功能', () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={mockRules}
          readonly={true}
        />
      )

      const switches = screen.getAllByRole('switch')
      const inputs = screen.getAllByRole('textbox')

      switches.forEach(switch_ => expect(switch_).toBeDisabled())
      inputs.forEach(input => expect(input).toBeDisabled())
    })
  })

  describe('不同字段类型', () => {
    it('应该为数字字段显示适用的规则类型', async () => {
      const numberField = { ...mockField, type: 'number' as const }

      render(
        <ValidationEditor
          field={numberField}
          rules={[]}
        />
      )

      // 点击选择器
      const selectTrigger = screen.getByText('选择验证规则类型')
      await user.click(selectTrigger)

      // 应该显示数字相关的规则
      expect(screen.getByText('最小值')).toBeInTheDocument()
      expect(screen.getByText('最大值')).toBeInTheDocument()
    })

    it('应该为选择字段显示适用的规则类型', async () => {
      const selectField = { ...mockField, type: 'select' as const }

      render(
        <ValidationEditor
          field={selectField}
          rules={[]}
        />
      )

      // 点击选择器
      const selectTrigger = screen.getByText('选择验证规则类型')
      await user.click(selectTrigger)

      // 选择字段通常只需要必填验证
      expect(screen.getByText('必填验证')).toBeInTheDocument()
    })

    it('应该为数字字段显示年龄预设', async () => {
      const numberField = { ...mockField, type: 'number' as const }

      render(
        <ValidationEditor
          field={numberField}
          rules={[]}
          config={{ showPresets: true }}
        />
      )

      // 切换到预设标签页
      const presetsTab = screen.getByText('预设模板')
      await user.click(presetsTab)

      expect(screen.getByText('年龄')).toBeInTheDocument()
    })
  })

  describe('空状态', () => {
    it('应该显示无规则的空状态', () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={[]}
        />
      )

      expect(screen.getByText('暂无验证规则')).toBeInTheDocument()
      expect(screen.getByText('请添加验证规则以开始配置')).toBeInTheDocument()
    })

    it('应该显示无规则的测试提示', async () => {
      render(
        <ValidationEditor
          field={mockField}
          rules={[]}
          config={{ showTestArea: true }}
        />
      )

      // 切换到测试标签页
      const testTab = screen.getByText('测试验证')
      await user.click(testTab)

      expect(screen.getByText('请先添加验证规则，然后可以在此测试验证效果')).toBeInTheDocument()
    })
  })
})