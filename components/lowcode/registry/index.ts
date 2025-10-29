/**
 * 组件注册系统导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 * 更新日期: 2025-10-29 (T007任务完成 - 验证规则引擎)
 */

// 类型定义导出
export * from './types'

// 属性定义和验证系统导出 (T006任务完成)
export {
  PropValidator,
  ResponsivePropManager,
  PropDependencyManager,
  PropEditorConfigGenerator,
  PropDefaultValueHandler,
  PropDefinitionManager,
  createPropSchema,
  validatePropSchema,
} from './property-definitions'

// 以下模块将在对应的任务中完成并启用导出
// 组件注册系统核心类导出 (T005任务)
// export {
//   ComponentRegistry,
//   getComponentRegistry,
//   defaultRegistry,
// } from './component-registry'

// 验证规则引擎导出 (T007任务)
// export * from './validation-rules'
