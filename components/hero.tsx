import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <div className="relative isolate px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">FlowBase</h2>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          专业的全栈低代码开发平台，让应用构建更简单、更高效。
          基于现代技术栈，提供从数据模型到页面设计的完整开发能力。
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button variant="default" size="lg" asChild>
            <Link href="/protected/projects">
              开始使用 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/docs">查看文档</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
