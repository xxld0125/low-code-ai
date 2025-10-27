// 页面设计器类型定义入口文件
export * from './component'
export * from './canvas'

// 避免冲突的类型导出
export type { PageDesign, PageDesignStatus } from './designer'
// export type { LayoutConfig } from './layout' // 暂时注释掉，因为不存在
// export type { ComponentPropertyConfig } from './properties' // 暂时注释掉，因为不存在
// export type { ApiResponse, PageDesignApiParams } from './api' // 暂时注释掉，因为不存在
