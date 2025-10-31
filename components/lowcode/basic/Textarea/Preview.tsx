/**
 * Textarea 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Textarea } from './Textarea'
import type { LowcodeTextareaProps } from './Textarea'

export interface TextareaPreviewProps {
  props?: Partial<LowcodeTextareaProps>
  styles?: React.CSSProperties
  showVariants?: boolean
  showStates?: boolean
  showSizes?: boolean
}

export const TextareaPreview: React.FC<TextareaPreviewProps> = ({
  props = {},
  styles = {},
  showVariants = false,
  showStates = false,
  showSizes = false,
}) => {
  // 默认预览属性 - 在组件库中只展示简单的基础文本域
  const defaultPreviewProps: LowcodeTextareaProps = {
    label: undefined,
    placeholder: '请输入内容',
    value: '',
    rows: 3,
    required: false,
    disabled: false,
    readonly: false,
    helper: undefined,
    resize: 'vertical',
    ...props,
  }

  return (
    <div style={styles} className="w-full">
      <Textarea {...defaultPreviewProps} disabled={true} className="pointer-events-none" />
    </div>
  )

  // 如果显示变体预览
  if (showVariants) {
    const variants = [
      {
        label: '基础文本域',
        props: { resize: 'vertical' as const },
      },
      {
        label: '不可调整',
        props: { resize: 'none' as const },
      },
      {
        label: '双向调整',
        props: { resize: 'both' as const },
      },
      {
        label: '带字符限制',
        props: { maxlength: 200, resize: 'vertical' as const },
      },
    ]

    return (
      <div style={styles} className="space-y-6">
        <h4 className="mb-4 text-sm font-medium text-gray-900">文本域变体</h4>
        <div className="grid grid-cols-1 gap-6">
          {variants.map((variant, index) => (
            <div key={index} className="space-y-3">
              <h5 className="text-xs font-medium text-gray-700">{variant.label}</h5>
              <Textarea
                {...defaultPreviewProps}
                {...variant.props}
                onChange={value => console.log(`Textarea ${variant.label} changed:`, value)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 如果显示尺寸预览
  if (showSizes) {
    const sizes = [
      { label: '小', rows: 2 },
      { label: '默认', rows: 4 },
      { label: '大', rows: 6 },
      { label: '特大', rows: 8 },
    ]

    return (
      <div style={styles} className="space-y-6">
        <h4 className="mb-4 text-sm font-medium text-gray-900">文本域尺寸</h4>
        <div className="grid grid-cols-1 gap-6">
          {sizes.map(size => (
            <div key={size.label} className="space-y-3">
              <h5 className="text-xs font-medium text-gray-700">
                {size.label} ({size.rows} 行)
              </h5>
              <Textarea
                {...defaultPreviewProps}
                rows={size.rows}
                label={`${size.label}文本域`}
                onChange={value => console.log(`Textarea ${size.label} changed:`, value)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 如果显示状态预览
  if (showStates) {
    const states = [
      {
        label: '默认状态',
        props: { disabled: false, readonly: false, error: undefined },
      },
      {
        label: '禁用状态',
        props: { disabled: true, readonly: false, error: undefined },
      },
      {
        label: '只读状态',
        props: { disabled: false, readonly: true, value: '这是一段只读的示例文本内容' },
      },
      {
        label: '错误状态',
        props: { disabled: false, readonly: false, error: '内容不能为空' },
      },
      {
        label: '必填状态',
        props: { disabled: false, readonly: false, required: true },
      },
    ]

    return (
      <div style={styles} className="space-y-6">
        <h4 className="mb-4 text-sm font-medium text-gray-900">文本域状态</h4>
        <div className="grid grid-cols-1 gap-6">
          {states.map(state => (
            <div key={state.label} className="space-y-3">
              <h5 className="text-xs font-medium text-gray-700">{state.label}</h5>
              <Textarea
                {...defaultPreviewProps}
                {...state.props}
                label={state.label}
                onChange={value => console.log(`Textarea ${state.label} changed:`, value)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 默认预览 - 展示主要功能
  return (
    <div style={styles} className="space-y-6">
      <h4 className="mb-4 text-sm font-medium text-gray-900">文本域预览</h4>

      {/* 基础文本域 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">基础文本域</h5>
        <Textarea
          {...defaultPreviewProps}
          onChange={value => console.log('Basic textarea changed:', value)}
        />
      </div>

      {/* 带字符限制的文本域 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">带字符限制</h5>
        <Textarea
          {...defaultPreviewProps}
          label="反馈内容"
          placeholder="请详细描述您遇到的问题..."
          maxlength={200}
          helper="最多输入200个字符"
          onChange={value => console.log('Limited textarea changed:', value)}
        />
      </div>

      {/* 不同调整方式 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">调整方式</h5>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Textarea
            {...defaultPreviewProps}
            label="垂直调整"
            resize="vertical"
            onChange={value => console.log('Vertical resize changed:', value)}
          />
          <Textarea
            {...defaultPreviewProps}
            label="不可调整"
            resize="none"
            onChange={value => console.log('No resize changed:', value)}
          />
        </div>
      </div>

      {/* 不同行数 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">不同行数</h5>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Textarea
            {...defaultPreviewProps}
            label="短文本"
            rows={2}
            placeholder="输入简短内容..."
            onChange={value => console.log('Short textarea changed:', value)}
          />
          <Textarea
            {...defaultPreviewProps}
            label="中等文本"
            rows={4}
            placeholder="输入中等长度内容..."
            onChange={value => console.log('Medium textarea changed:', value)}
          />
          <Textarea
            {...defaultPreviewProps}
            label="长文本"
            rows={6}
            placeholder="输入长篇内容..."
            onChange={value => console.log('Long textarea changed:', value)}
          />
        </div>
      </div>

      {/* 特殊用途示例 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">特殊用途示例</h5>
        <div className="space-y-4">
          {/* 产品描述 */}
          <Textarea
            label="产品描述"
            placeholder="请详细描述产品特性、用途和优势..."
            rows={5}
            required
            maxlength={1000}
            helper="请提供详细的产品描述，有助于用户了解产品"
            onChange={value => console.log('Product description changed:', value)}
          />

          {/* 用户反馈 */}
          <Textarea
            label="用户反馈"
            placeholder="请分享您的使用体验和建议..."
            rows={4}
            helper="您的反馈对我们非常重要，我们将认真阅读每一条建议"
            onChange={value => console.log('User feedback changed:', value)}
          />
        </div>
      </div>
    </div>
  )
}

// 导出用于特定场景的预览组件
export const TextareaVariantPreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <TextareaPreview showVariants={true} styles={styles} />
)

export const TextareaStatePreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <TextareaPreview showStates={true} styles={styles} />
)

export const TextareaSizePreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <TextareaPreview showSizes={true} styles={styles} />
)

// 交互式预览组件
export const TextareaInteractivePreview: React.FC<{ styles?: React.CSSProperties }> = ({
  styles,
}) => {
  const [value, setValue] = React.useState('')
  const [feedback, setFeedback] = React.useState('')

  return (
    <div style={styles} className="space-y-6">
      <h4 className="mb-4 text-sm font-medium text-gray-900">交互式文本域</h4>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 实时字数统计 */}
        <div className="space-y-3">
          <h5 className="text-xs font-medium text-gray-700">实时字数统计</h5>
          <Textarea
            label="评论内容"
            placeholder="写下您的评论..."
            value={value}
            maxlength={300}
            helper={`已输入 ${value.length}/300 字符`}
            onChange={newValue => setValue(newValue)}
          />
        </div>

        {/* 反馈展示 */}
        <div className="space-y-3">
          <h5 className="text-xs font-medium text-gray-700">用户反馈</h5>
          <Textarea
            label="您的反馈"
            placeholder="系统会将您的反馈实时显示在这里..."
            value={feedback}
            readonly
            helper="这是只读的反馈展示区域"
          />
          <button
            onClick={() => setFeedback(value)}
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            提交反馈
          </button>
        </div>
      </div>
    </div>
  )
}

// 默认导出
export default TextareaPreview
