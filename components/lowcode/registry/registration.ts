/**
 * 组件注册初始化文件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 * 任务: T102 - 在registry中注册所有布局组件
 *
 * 此文件负责将所有组件定义注册到全局组件注册表中
 */

import { getComponentRegistry } from './component-registry'
import {
  FORM_COMPONENT_DEFINITIONS,
  DISPLAY_COMPONENT_DEFINITIONS,
  LAYOUT_COMPONENT_DEFINITIONS,
} from './index'
import { convertToFullComponentDefinition } from './type-conversion'

/**
 * 注册所有组件到全局注册表
 */
export async function registerAllComponents(): Promise<void> {
  const registry = getComponentRegistry()

  try {
    // 注册表单组件
    console.log('正在注册表单组件...')
    for (const definition of FORM_COMPONENT_DEFINITIONS) {
      const fullDefinition = convertToFullComponentDefinition(definition)
      const result = await registry.register(fullDefinition)
      if (!result.success) {
        console.error(`注册表单组件失败: ${definition.type}`, result.errors)
      } else {
        console.log(`✓ 成功注册表单组件: ${definition.type}`)
      }
    }

    // 注册展示组件
    console.log('正在注册展示组件...')
    for (const definition of DISPLAY_COMPONENT_DEFINITIONS) {
      const fullDefinition = convertToFullComponentDefinition(definition)
      const result = await registry.register(fullDefinition)
      if (!result.success) {
        console.error(`注册展示组件失败: ${definition.type}`, result.errors)
      } else {
        console.log(`✓ 成功注册展示组件: ${definition.type}`)
      }
    }

    // 注册布局组件
    console.log('正在注册布局组件...')
    for (const definition of LAYOUT_COMPONENT_DEFINITIONS) {
      const fullDefinition = convertToFullComponentDefinition(definition)
      const result = await registry.register(fullDefinition)
      if (!result.success) {
        console.error(`注册布局组件失败: ${definition.type}`, result.errors)
      } else {
        console.log(`✓ 成功注册布局组件: ${definition.type}`)
      }
    }

    console.log('组件注册完成！')

    // 打印注册统计信息
    const stats = registry.getStats()
    console.log('注册统计信息:', {
      总组件数: stats.total_components,
      活跃组件数: stats.active_components,
      分类统计: stats.categories,
    })

  } catch (error) {
    console.error('组件注册过程中发生错误:', error)
    throw error
  }
}

/**
 * 初始化组件注册系统
 * 通常在应用启动时调用
 */
export async function initializeComponentRegistry(): Promise<void> {
  console.log('初始化组件注册系统...')

  try {
    await registerAllComponents()
    console.log('✓ 组件注册系统初始化完成')
  } catch (error) {
    console.error('✗ 组件注册系统初始化失败:', error)
    throw error
  }
}

/**
 * 按分类注册组件
 */
export async function registerComponentsByCategory(category: 'form' | 'display' | 'layout'): Promise<void> {
  const registry = getComponentRegistry()

  const componentMap = {
    form: FORM_COMPONENT_DEFINITIONS,
    display: DISPLAY_COMPONENT_DEFINITIONS,
    layout: LAYOUT_COMPONENT_DEFINITIONS,
  }

  const definitions = componentMap[category]
  if (!definitions) {
    throw new Error(`未知的组件分类: ${category}`)
  }

  console.log(`正在注册${category}组件...`)

  for (const definition of definitions) {
    const fullDefinition = convertToFullComponentDefinition(definition)
    const result = await registry.register(fullDefinition)
    if (!result.success) {
      console.error(`注册${category}组件失败: ${definition.type}`, result.errors)
    } else {
      console.log(`✓ 成功注册${category}组件: ${definition.type}`)
    }
  }
}

/**
 * 检查组件是否已注册
 */
export function checkComponentRegistration(): void {
  const registry = getComponentRegistry()

  const allDefinitions = [
    ...FORM_COMPONENT_DEFINITIONS,
    ...DISPLAY_COMPONENT_DEFINITIONS,
    ...LAYOUT_COMPONENT_DEFINITIONS,
  ]

  console.log('检查组件注册状态...')

  const unregisteredComponents: string[] = []
  const registeredComponents: string[] = []

  for (const definition of allDefinitions) {
    const fullDefinition = convertToFullComponentDefinition(definition)
    if (registry.has(fullDefinition.id)) {
      registeredComponents.push(fullDefinition.id)
    } else {
      unregisteredComponents.push(fullDefinition.id)
    }
  }

  console.log(`已注册组件 (${registeredComponents.length}):`, registeredComponents)

  if (unregisteredComponents.length > 0) {
    console.warn(`未注册组件 (${unregisteredComponents.length}):`, unregisteredComponents)
  }
}

/**
 * 获取注册统计信息
 */
export function getRegistrationStats(): void {
  const registry = getComponentRegistry()
  const stats = registry.getStats()

  console.log('=== 组件注册统计 ===')
  console.log(`总组件数: ${stats.total_components}`)
  console.log(`活跃组件数: ${stats.active_components}`)
  console.log(`废弃组件数: ${stats.deprecated_components}`)
  console.log('分类统计:')

  Object.entries(stats.categories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`)
  })

  console.log(`最近更新: ${stats.latest_updated}`)
}

/**
 * 清空注册表（仅用于开发环境）
 */
export function clearRegistry(): void {
  if (process.env.NODE_ENV === 'development') {
    const registry = getComponentRegistry()
    registry.clear()
    console.log('注册表已清空（开发环境）')
  } else {
    console.warn('清空注册表操作仅在开发环境中可用')
  }
}