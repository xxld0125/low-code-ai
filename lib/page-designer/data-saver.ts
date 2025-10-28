import { createClient } from '@/lib/supabase/client'
import type { PageDesign, ComponentInstance } from '@/types/page-designer'

/**
 * 页面设计数据保存器
 * 负责保存页面设计和组件数据到数据库
 */
export class DataSaver {
  private supabase = createClient()

  /**
   * 保存页面设计
   */
  async savePageDesign(
    pageDesign: Partial<PageDesign>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('page_designs')
        .upsert({
          ...pageDesign,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('保存页面设计失败:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('保存页面设计异常:', error)
      return { success: false, error: '保存失败' }
    }
  }

  /**
   * 保存组件实例
   */
  async saveComponent(
    component: Partial<ComponentInstance>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('component_instances')
        .upsert({
          ...component,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('保存组件失败:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('保存组件异常:', error)
      return { success: false, error: '保存失败' }
    }
  }

  /**
   * 批量保存组件
   */
  async saveComponents(
    components: Partial<ComponentInstance>[]
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // 添加时间戳
      const componentsWithTimestamp = components.map(component => ({
        ...component,
        updated_at: new Date().toISOString(),
      }))

      const { data, error } = await this.supabase
        .from('component_instances')
        .upsert(componentsWithTimestamp)
        .select()

      if (error) {
        console.error('批量保存组件失败:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('批量保存组件异常:', error)
      return { success: false, error: '批量保存失败' }
    }
  }

  /**
   * 删除组件
   */
  async deleteComponent(componentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('component_instances')
        .delete()
        .eq('id', componentId)

      if (error) {
        console.error('删除组件失败:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('删除组件异常:', error)
      return { success: false, error: '删除失败' }
    }
  }

  /**
   * 保存完整的设计数据
   */
  async saveFullDesign(
    pageDesign: Partial<PageDesign>,
    components: Partial<ComponentInstance>[]
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // 并行保存页面设计和组件
      const [pageResult, componentsResult] = await Promise.all([
        this.savePageDesign(pageDesign),
        this.saveComponents(components),
      ])

      if (!pageResult.success) {
        return { success: false, error: pageResult.error }
      }

      if (!componentsResult.success) {
        return { success: false, error: componentsResult.error }
      }

      return {
        success: true,
        data: {
          pageDesign: pageResult.data,
          components: componentsResult.data,
        },
      }
    } catch (error) {
      console.error('保存完整设计数据异常:', error)
      return { success: false, error: '保存失败' }
    }
  }

  /**
   * 自动保存页面设计状态
   */
  async autoSave(
    pageDesignId: string,
    componentTree: any,
    thumbnail?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('page_designs')
        .update({
          component_tree: componentTree,
          thumbnail_url: thumbnail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pageDesignId)

      if (error) {
        console.error('自动保存失败:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('自动保存异常:', error)
      return { success: false, error: '自动保存失败' }
    }
  }
}

// 创建全局数据保存器实例
export const dataSaver = new DataSaver()
