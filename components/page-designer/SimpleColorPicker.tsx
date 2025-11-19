'use client'

import React from 'react'
import { Input } from '@/components/ui/input'

interface SimpleColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: SimpleColorPickerProps) {
  const validateColor = (color: string) => {
    // 简单的颜色格式验证
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const namedColors = [
      'black',
      'white',
      'red',
      'blue',
      'green',
      'yellow',
      'purple',
      'pink',
      'gray',
      'orange',
    ]

    return hexRegex.test(color) || namedColors.includes(color.toLowerCase())
  }

  const handleInputChange = (color: string) => {
    onChange(color)
  }

  const handleColorChange = (color: string) => {
    // 将颜色值转换为小写格式 #ffffff
    const lowerColor = color.toLowerCase()
    onChange(lowerColor)
  }

  return (
    <div className="flex items-center space-x-3">
      {/* 颜色预览框 */}
      <div className="relative">
        <input
          type="color"
          value={value.startsWith('#') ? value : '#000000'}
          onChange={e => handleColorChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border-2 border-gray-300"
          title="点击选择颜色"
        />
        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-gray-300 bg-white shadow-sm"></div>
      </div>

      {/* 颜色值输入框 */}
      <div className="flex-1">
        <Input
          value={value}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="#ffffff"
          className="font-mono text-sm"
          title="输入颜色值 (如: #ffffff)"
        />
        {!validateColor(value) && value && (
          <div className="mt-1 text-xs text-red-500">请输入有效的颜色值</div>
        )}
      </div>
    </div>
  )
}
