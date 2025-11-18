'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export function EnvVarWarning() {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>环境变量缺失</strong> - 请配置
        <Link
          href="https://nextjs.org/docs/basic-features/environment-variables"
          className="ml-1 underline hover:no-underline"
        >
          环境变量
        </Link>
        以正常运行应用程序。
      </AlertDescription>
    </Alert>
  )
}
