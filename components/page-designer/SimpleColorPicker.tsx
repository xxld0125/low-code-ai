'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface SimpleColorPickerProps {
  value: string
  onChange: (color: string) => void
}

// MVP简化预设颜色
const PRESET_COLORS = [
  '#000000',
  '#FFFFFF',
  '#EF4444',
  '#F87171',
  '#FBBF24',
  '#FDE047',
  '#10B981',
  '#34D399',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#A855F7',
  '#EC4899',
  '#F43F5E',
  '#6B7280',
  '#D1D5DB',
]

export function ColorPicker({ value, onChange }: SimpleColorPickerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <div className="space-y-3">
      {/* 颜色预览和输入 */}
      <div className="flex items-center space-x-3">
        <div
          className="h-12 w-12 rounded border-2 border-gray-300"
          style={{ backgroundColor: value }}
        />

        <div className="flex-1">
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="#000000"
            className="font-mono text-sm"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
          title="复制颜色"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>

      {/* 预设颜色网格 */}
      <div className="grid grid-cols-8 gap-2">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            className={`h-8 w-8 rounded border-2 transition-all hover:scale-110 ${
              value.toLowerCase() === color.toLowerCase()
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>

      {/* 常用颜色快速选择 */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange('#000000')}
          className="h-8 w-8 bg-black p-0 text-white"
          title="黑色"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange('#FFFFFF')}
          className="h-8 w-8 border-gray-300 bg-white p-0"
          title="白色"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange('#EF4444')}
          className="h-8 w-8 bg-red-500 p-0 text-white"
          title="红色"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange('#3B82F6')}
          className="h-8 w-8 bg-blue-500 p-0 text-white"
          title="蓝色"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange('#10B981')}
          className="h-8 w-8 bg-emerald-500 p-0 text-white"
          title="绿色"
        />
      </div>
    </div>
  )
}
