import { createClient } from '@/lib/supabase/server'
import { createClient as createClientClient } from '@/lib/supabase/client'

/**
 * 权限检查工具类
 * 统一管理页面设计器的权限验证逻辑
 */
export class PermissionChecker {
  /**
   * 检查用户是否有权限访问页面设计
   */
  static async checkPageDesignAccess(
    pageDesignId: string,
    userId: string,
    requiredPermission: 'view' | 'edit' | 'share' = 'view'
  ): Promise<{
    hasPermission: boolean
    pageDesign?: any
    error?: string
  }> {
    try {
      const supabase = await createClient()

      // 查询页面设计
      const { data: pageDesign, error } = await supabase
        .from('page_designs')
        .select('*')
        .eq('id', pageDesignId)
        .single()

      if (error || !pageDesign) {
        return {
          hasPermission: false,
          error: '页面设计不存在',
        }
      }

      // 检查是否为创建者
      if (pageDesign.user_id === userId) {
        return {
          hasPermission: true,
          pageDesign,
        }
      }

      // 检查是否在分享列表中
      const sharedWith = pageDesign.shared_with || []
      if (!sharedWith.includes(userId)) {
        return {
          hasPermission: false,
          error: '您没有权限访问此页面设计',
        }
      }

      // 根据所需权限检查
      if (requiredPermission === 'share') {
        // 只有创建者可以分享
        return {
          hasPermission: false,
          error: '只有创建者可以分享页面设计',
        }
      }

      return {
        hasPermission: true,
        pageDesign,
      }
    } catch (error) {
      console.error('权限检查失败:', error)
      return {
        hasPermission: false,
        error: '权限检查失败',
      }
    }
  }

  /**
   * 服务端权限检查（用于API路由）
   */
  static async checkApiPermission(
    request: Request,
    pageDesignId: string,
    requiredPermission: 'view' | 'edit' | 'share' = 'view'
  ): Promise<{
    hasPermission: boolean
    user?: any
    pageDesign?: any
    error?: string
  }> {
    try {
      const supabase = await createClient()

      // 获取用户信息
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        return {
          hasPermission: false,
          error: '未授权访问',
        }
      }

      return await this.checkPageDesignAccess(pageDesignId, user.id, requiredPermission)
    } catch (error) {
      console.error('API权限检查失败:', error)
      return {
        hasPermission: false,
        error: '权限检查失败',
      }
    }
  }

  /**
   * 客户端权限检查（用于组件）
   */
  static async checkClientPermission(
    pageDesignId: string,
    requiredPermission: 'view' | 'edit' | 'share' = 'view'
  ): Promise<{
    hasPermission: boolean
    user?: any
    pageDesign?: any
    error?: string
  }> {
    try {
      const supabase = createClientClient()

      // 获取用户信息
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        return {
          hasPermission: false,
          error: '未授权访问',
        }
      }

      return await this.checkPageDesignAccess(pageDesignId, user.id, requiredPermission)
    } catch (error) {
      console.error('客户端权限检查失败:', error)
      return {
        hasPermission: false,
        error: '权限检查失败',
      }
    }
  }

  /**
   * 检查用户是否存在（用于分享功能）
   */
  static async validateUsers(userIds: string[]): Promise<{
    valid: boolean
    validUsers: string[]
    invalidUsers: string[]
    error?: string
  }> {
    try {
      const supabase = await createClient()

      // 查询用户信息（从profiles表而不是auth.users）
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id')
        .in('id', userIds)

      if (error) {
        console.error('验证用户失败:', error)
        return {
          valid: false,
          validUsers: [],
          invalidUsers: userIds,
          error: '验证用户失败',
        }
      }

      const validUserIds = profiles?.map((p: any) => p.id) || []
      const invalidUserIds = userIds.filter(id => !validUserIds.includes(id))

      return {
        valid: invalidUserIds.length === 0,
        validUsers: validUserIds,
        invalidUsers: invalidUserIds,
      }
    } catch (error) {
      console.error('验证用户异常:', error)
      return {
        valid: false,
        validUsers: [],
        invalidUsers: userIds,
        error: '验证用户失败',
      }
    }
  }
}
