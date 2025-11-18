'use client'

import { useParams } from 'next/navigation'
import { SimplePageDesignerLayout } from '@/components/page-designer/SimplePageDesignerLayout'

export default function PageBuilderPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="h-screen w-full">
      <SimplePageDesignerLayout projectId={projectId} />
    </div>
  )
}
