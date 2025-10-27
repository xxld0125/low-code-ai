import { Metadata } from 'next'
import { DesignerLayout } from '@/components/designer/DesignerLayout'

export const metadata: Metadata = {
  title: 'Data Model Designer | Low-Code AI Platform',
  description: 'Visual data model designer for creating database tables and relationships',
}

export default function DesignerPage() {
  return (
    <div className="h-screen w-full">
      <DesignerLayout projectId="default" />
    </div>
  )
}
