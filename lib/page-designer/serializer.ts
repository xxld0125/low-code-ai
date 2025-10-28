import type { ComponentInstance, PageDesign, ComponentTree } from '@/types/page-designer'

/**
 * 页面设计数据序列化器
 * 负责组件树结构的序列化和反序列化
 */
export class DataSerializer {
  /**
   * 序列化组件树为JSON字符串
   */
  serializeComponentTree(componentTree: ComponentTree): string {
    try {
      const serialized = {
        version: componentTree.version,
        timestamp: new Date().toISOString(),
        data: {
          root_id: componentTree.root_id,
          components: this.serializeComponents(componentTree.components),
          hierarchy: componentTree.hierarchy,
        },
      }

      return JSON.stringify(serialized)
    } catch (error) {
      console.error('序列化组件树失败:', error)
      throw new Error('序列化失败')
    }
  }

  /**
   * 反序列化JSON字符串为组件树
   */
  deserializeComponentTree(data: string): ComponentTree {
    try {
      const parsed = JSON.parse(data)

      return {
        version: parsed.version || '1.0',
        root_id: parsed.data?.root_id || '',
        components: this.deserializeComponents(parsed.data?.components || {}),
        hierarchy: parsed.data?.hierarchy || [],
      }
    } catch (error) {
      console.error('反序列化组件树失败:', error)
      throw new Error('反序列化失败')
    }
  }

  /**
   * 序列化组件对象
   */
  private serializeComponents(components: Record<string, ComponentInstance>): Record<string, any> {
    const serialized: Record<string, any> = {}

    Object.entries(components).forEach(([id, component]) => {
      serialized[id] = {
        id: component.id,
        page_design_id: component.page_design_id,
        component_type: component.component_type,
        parent_id: component.parent_id,
        position: component.position,
        props: this.serializeProps(component.props),
        styles: component.styles,
        events: component.events,
        responsive: component.responsive,
        layout_props: component.layout_props,
        meta: component.meta,
        created_at: component.created_at,
        updated_at: component.updated_at,
        version: component.version,
      }
    })

    return serialized
  }

  /**
   * 反序列化组件对象
   */
  private deserializeComponents(
    components: Record<string, any>
  ): Record<string, ComponentInstance> {
    const deserialized: Record<string, ComponentInstance> = {}

    Object.entries(components).forEach(([id, component]) => {
      deserialized[id] = {
        id: component.id,
        page_design_id: component.page_design_id,
        component_type: component.component_type,
        parent_id: component.parent_id,
        position: component.position,
        props: this.deserializeProps(component.props),
        styles: component.styles,
        events: component.events,
        responsive: component.responsive,
        layout_props: component.layout_props,
        meta: component.meta,
        created_at: component.created_at,
        updated_at: component.updated_at,
        version: component.version,
      } as ComponentInstance
    })

    return deserialized
  }

  /**
   * 序列化组件属性
   */
  private serializeProps(props: Record<string, any>): Record<string, any> {
    // 处理特殊属性类型，如Date等（移除函数序列化以避免安全风险）
    const serialized: Record<string, any> = {}

    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'function') {
        // 跳过函数类型，记录警告
        console.warn('函数类型属性将被跳过:', key)
        return
      } else if (value instanceof Date) {
        serialized[key] = {
          _type: 'date',
          _value: value.toISOString(),
        }
      } else if (typeof value === 'object' && value !== null) {
        // 深度序列化对象
        serialized[key] = this.serializeObject(value)
      } else {
        serialized[key] = value
      }
    })

    return serialized
  }

  /**
   * 反序列化组件属性
   */
  private deserializeProps(props: Record<string, any>): Record<string, any> {
    const deserialized: Record<string, any> = {}

    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && value._type) {
        switch (value._type) {
          case 'date':
            deserialized[key] = new Date(value._value)
            break
          case 'object':
            deserialized[key] = this.deserializeObject(value._value)
            break
          default:
            deserialized[key] = value._value
        }
      } else if (typeof value === 'object' && value !== null) {
        deserialized[key] = this.deserializeObject(value)
      } else {
        deserialized[key] = value
      }
    })

    return deserialized
  }

  /**
   * 序列化对象
   */
  private serializeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeObject(item))
    } else if (typeof obj === 'object' && obj !== null) {
      const serialized: any = { _type: 'object', _value: {} }

      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'function') {
          // 跳过函数类型，记录警告
          console.warn('对象中的函数类型属性将被跳过:', key)
          return
        } else if (value instanceof Date) {
          serialized._value[key] = {
            _type: 'date',
            _value: value.toISOString(),
          }
        } else if (typeof value === 'object' && value !== null) {
          serialized._value[key] = this.serializeObject(value)
        } else {
          serialized._value[key] = value
        }
      })

      return serialized
    }

    return obj
  }

  /**
   * 反序列化对象
   */
  private deserializeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.deserializeObject(item))
    } else if (typeof obj === 'object' && obj !== null && obj._type === 'object') {
      const deserialized: any = {}

      Object.entries((obj as any)._value).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value !== null && value._type) {
          switch (value._type) {
            case 'date':
              deserialized[key] = new Date(value._value)
              break
            case 'object':
              deserialized[key] = this.deserializeObject(value)
              break
            default:
              deserialized[key] = value._value
          }
        } else if (typeof value === 'object' && value !== null) {
          deserialized[key] = this.deserializeObject(value)
        } else {
          deserialized[key] = value
        }
      })

      return deserialized
    }

    return obj
  }

  /**
   * 压缩序列化数据
   */
  compress(data: string): string {
    // 简单的压缩实现，实际项目中可以使用更高效的压缩算法
    try {
      return Buffer.from(data, 'utf8').toString('base64')
    } catch (error) {
      console.error('压缩数据失败:', error)
      return data
    }
  }

  /**
   * 解压缩数据
   */
  decompress(compressedData: string): string {
    try {
      return Buffer.from(compressedData, 'base64').toString('utf8')
    } catch (error) {
      console.error('解压缩数据失败:', error)
      return compressedData
    }
  }

  /**
   * 导出页面设计为JSON
   */
  exportDesign(pageDesign: PageDesign, components: ComponentInstance[]): string {
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      pageDesign: {
        id: pageDesign.id,
        name: pageDesign.name,
        description: pageDesign.description,
        config: pageDesign.config,
        tags: pageDesign.tags,
      },
      components: this.serializeComponents(Object.fromEntries(components.map(c => [c.id, c]))),
      componentTree: pageDesign.component_tree,
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 从JSON导入页面设计
   */
  importDesign(data: string): {
    pageDesign: Partial<PageDesign>
    components: ComponentInstance[]
  } {
    const importData = JSON.parse(data)

    return {
      pageDesign: {
        name: importData.pageDesign.name,
        description: importData.pageDesign.description,
        config: importData.pageDesign.config,
        tags: importData.pageDesign.tags,
      },
      components: Object.values(this.deserializeComponents(importData.components)),
    }
  }
}

// 创建全局序列化器实例
export const dataSerializer = new DataSerializer()
