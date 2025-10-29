/**
 * Jest类型定义
 * 功能模块: 测试配置
 * 创建日期: 2025-10-29
 */

// Jest自定义匹配器类型
export {}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeComponentWithProps: (componentType: string, props: Record<string, unknown>) => R
      toBeValidComponent: () => R
      toHaveCorrectProps: (expectedProps: Record<string, unknown>) => R
    }
  }
}
