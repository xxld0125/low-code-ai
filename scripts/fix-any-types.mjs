#!/usr/bin/env node

/**
 * 自动修复 any 类型的脚本
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const currentDir = path.dirname(__filename)

// 需要处理的文件列表
const filesToFix = [
  'lib/lowcode/style-engine/preview.ts',
  'lib/lowcode/utils/error-handling.ts',
  'lib/lowcode/validation/style-validator.ts'
]

// any 类型替换规则
const replacementRules = [
  {
    pattern: /: any(\[\])?/g,
    replacement: ': unknown$1'
  },
  {
    pattern: /\bany\b(?!\s*\|)/g,
    replacement: 'unknown'
  }
]

// 特定文件的替换规则
const specificReplacements = {
  'lib/lowcode/style-engine/preview.ts': [
    {
      pattern: /data: any/g,
      replacement: 'data: unknown'
    },
    {
      pattern: /options\?: \{[^}]*\}/g,
      replacement: 'options?: Record<string, unknown>'
    }
  ],
  'lib/lowcode/utils/error-handling.ts': [
    {
      pattern: /T extends \(\.\.\.args: any\[\]\) => any/g,
      replacement: 'T extends (...args: unknown[]) => unknown'
    },
    {
      pattern: /details\?: Record<string, any>/g,
      replacement: 'details?: Record<string, unknown>'
    }
  ],
  'lib/lowcode/validation/style-validator.ts': [
    {
      pattern: /value: any/g,
      replacement: 'value: unknown'
    },
    {
      pattern: /config: Record<string, any>/g,
      replacement: 'config: Record<string, unknown>'
    }
  ]
}

function fixFile(filePath) {
  console.log(`处理文件: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    console.log(`  文件不存在，跳过: ${filePath}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  const originalContent = content

  // 应用通用替换规则
  replacementRules.forEach(rule => {
    content = content.replace(rule.pattern, rule.replacement)
  })

  // 应用特定文件的替换规则
  if (specificReplacements[filePath]) {
    specificReplacements[filePath].forEach(rule => {
      content = content.replace(rule.pattern, rule.replacement)
    })
  }

  // 只有内容发生变化时才写入文件
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content)
    console.log(`  ✓ 已修复: ${filePath}`)
  } else {
    console.log(`  - 无需修复: ${filePath}`)
  }
}

// 处理所有文件
filesToFix.forEach(file => {
  const fullPath = path.join(currentDir, '..', file)
  fixFile(fullPath)
})

console.log('✅ 修复完成！')