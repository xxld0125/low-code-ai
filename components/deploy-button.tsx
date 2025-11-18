'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface DeployButtonProps {
  projectId?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DeployButton({ projectId, className, size = 'md' }: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = async () => {
    if (!projectId) {
      toast({
        title: '部署失败',
        description: '项目ID不能为空',
        variant: 'destructive',
      })
      return
    }

    setIsDeploying(true)

    try {
      // 模拟部署过程
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: '部署成功',
        description: '项目已成功部署到生产环境',
      })
    } catch (error) {
      toast({
        title: '部署失败',
        description: error instanceof Error ? error.message : '部署过程中出现错误',
        variant: 'destructive',
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Button
      onClick={handleDeploy}
      disabled={!projectId || isDeploying}
      className={className}
      size={size}
      variant="default"
    >
      {isDeploying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isDeploying ? '部署中...' : '部署项目'}
    </Button>
  )
}
