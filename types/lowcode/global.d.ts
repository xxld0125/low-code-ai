/**
 * 低代码组件库全局类型声明
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.bmp' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

// 扩展Jest匹配器
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveComponent(componentType: React.ComponentType): R
      toHaveComponentWithProps(
        componentType: React.ComponentType,
        props: Record<string, unknown>
      ): R
    }
  }
}
