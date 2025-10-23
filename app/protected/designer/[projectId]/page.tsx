'use client'

import { useParams } from 'next/navigation'
import { DesignerLayout } from '@/components/designer/DesignerLayout'

export default function ProjectDesignerPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="h-screen w-full">
      <DesignerLayout projectId={projectId} />
    </div>
  )
}
