'use client'

import React from 'react'
import { DesignSystemExamples } from '@/lib/lowcode/design-system/examples'
import { ThemeSwitcher } from '@/components/theme-switcher'

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">设计系统演示</h1>
            <p className="text-muted-foreground">shadcn/ui + 自定义设计系统集成</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <DesignSystemExamples />
      </main>

      {/* 页面底部 */}
      <footer className="mt-16 border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>低代码开发平台 - 设计系统演示页面</p>
        </div>
      </footer>
    </div>
  )
}
