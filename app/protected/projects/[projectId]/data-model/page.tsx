'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Table2, Plus, Settings } from 'lucide-react'

export default function DataModelDesignerPage() {
  // const params = useParams()
  // const projectId = params.projectId as string // 为将来使用保留

  return (
    <div className="h-screen w-full bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">数据模型设计器</h1>
          <p className="mt-2 text-gray-600">设计和管理你的数据表结构与字段</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 左侧：表列表 */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database size={20} />
                  数据表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus size={16} className="mr-2" />
                    创建新表
                  </Button>
                  <div className="py-8 text-center text-gray-500">
                    <Table2 size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无数据表</p>
                    <p className="text-xs">点击上方按钮创建第一个表</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间：表设计画布 */}
          <div className="col-span-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">设计画布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Database size={64} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">开始设计数据模型</h3>
                    <p className="text-gray-600">选择左侧的表或创建新表开始设计</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：属性面板 */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings size={20} />
                  属性配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center text-gray-500">
                  <Settings size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">选择表或字段</p>
                  <p className="text-xs">在画布中选择表或字段进行配置</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
