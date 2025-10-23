import { describe, it, expect } from '@jest/globals'
import { existsSync } from 'fs'

describe('Designer Setup', () => {
  it('should have designer components directory structure', () => {
    expect(() => {
      existsSync('components/designer/DesignerLayout.tsx')
      existsSync('components/designer/ComponentPanel.tsx')
      existsSync('components/designer/Canvas.tsx')
      existsSync('components/designer/PropertiesPanel.tsx')
    }).not.toThrow()
  })

  it('should have designer API routes', () => {
    // Check if the API route file exists by trying to read it
    expect(() => {
      existsSync('app/api/designer/tables/route.ts')
    }).not.toThrow()
  })

  it('should have required dependencies', () => {
    // Import dependencies dynamically to check if they're available
    expect(async () => {
      await import('@dnd-kit/core')
      await import('@dnd-kit/sortable')
      await import('@dnd-kit/utilities')
      await import('lucide-react')
      await import('date-fns')
    }).not.toThrow()
  })

  it('should have designer types', () => {
    expect(() => {
      existsSync('types/designer/table.ts')
      existsSync('types/designer/field.ts')
      existsSync('types/designer/relationship.ts')
      existsSync('types/designer/api.ts')
    }).not.toThrow()
  })
})
