import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock history manager
interface PropertyChange {
  id: string
  componentId: string
  propertyName: string
  oldValue: any
  newValue: any
  timestamp: number
  description: string
}

interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  currentIndex: number
  history: PropertyChange[]
}

// Mock history manager class
class PropertyHistoryManager {
  private history: PropertyChange[] = []
  private currentIndex = -1
  private maxHistorySize = 50

  recordChange(change: Omit<PropertyChange, 'id' | 'timestamp'>): void {
    const propertyChange: PropertyChange = {
      ...change,
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    // 如果当前不在历史记录的末尾，删除后面的记录
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    this.history.push(propertyChange)
    this.currentIndex++

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }
  }

  undo(): PropertyChange | null {
    if (this.canUndo()) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  redo(): PropertyChange | null {
    if (this.canRedo()) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  getState(): HistoryState {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      history: [...this.history],
    }
  }

  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  getHistoryForComponent(componentId: string): PropertyChange[] {
    return this.history.filter(change => change.componentId === componentId)
  }
}

describe('PropertyHistoryManager', () => {
  let historyManager: PropertyHistoryManager

  beforeEach(() => {
    historyManager = new PropertyHistoryManager()
  })

  describe('recordChange', () => {
    it('should record a property change correctly', () => {
      const change = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'old value',
        newValue: 'new value',
        description: 'Changed text from "old value" to "new value"',
      }

      historyManager.recordChange(change)

      const state = historyManager.getState()
      expect(state.history).toHaveLength(1)
      expect(state.history[0]).toMatchObject(change)
      expect(state.history[0].id).toMatch(/^change-\d+-[a-z0-9]+$/)
      expect(typeof state.history[0].timestamp).toBe('number')
      expect(state.currentIndex).toBe(0)
    })

    it('should generate unique IDs for each change', () => {
      const change1 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'First change',
      }

      const change2 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value2',
        newValue: 'value3',
        description: 'Second change',
      }

      historyManager.recordChange(change1)
      historyManager.recordChange(change2)

      const state = historyManager.getState()
      expect(state.history[0].id).not.toBe(state.history[1].id)
    })

    it('should handle timestamp generation correctly', () => {
      const beforeTime = Date.now()

      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'old',
        newValue: 'new',
        description: 'Test change',
      })

      const afterTime = Date.now()
      const state = historyManager.getState()

      expect(state.history[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(state.history[0].timestamp).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('undo', () => {
    it('should undo the last change', () => {
      const change1 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'First change',
      }

      const change2 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value2',
        newValue: 'value3',
        description: 'Second change',
      }

      historyManager.recordChange(change1)
      historyManager.recordChange(change2)

      const undoneChange = historyManager.undo()
      expect(undoneChange).toMatchObject(change2)
      expect(historyManager.getState().currentIndex).toBe(0)
    })

    it('should return null when no changes to undo', () => {
      const result = historyManager.undo()
      expect(result).toBeNull()
    })

    it('should not undo beyond the first change', () => {
      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'Test change',
      })

      historyManager.undo()
      const result = historyManager.undo()
      expect(result).toBeNull()
      expect(historyManager.getState().currentIndex).toBe(0)
    })
  })

  describe('redo', () => {
    it('should redo the previously undone change', () => {
      const change1 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'First change',
      }

      const change2 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value2',
        newValue: 'value3',
        description: 'Second change',
      }

      historyManager.recordChange(change1)
      historyManager.recordChange(change2)

      historyManager.undo()
      const redoneChange = historyManager.redo()

      expect(redoneChange).toMatchObject(change2)
      expect(historyManager.getState().currentIndex).toBe(1)
    })

    it('should return null when no changes to redo', () => {
      const result = historyManager.redo()
      expect(result).toBeNull()
    })

    it('should not redo beyond the last change', () => {
      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'Test change',
      })

      const result = historyManager.redo()
      expect(result).toBeNull()
      expect(historyManager.getState().currentIndex).toBe(0)
    })
  })

  describe('canUndo', () => {
    it('should return false when no changes recorded', () => {
      expect(historyManager.canUndo()).toBe(false)
    })

    it('should return false when only one change recorded', () => {
      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'Test change',
      })

      expect(historyManager.canUndo()).toBe(false)
    })

    it('should return true when multiple changes recorded', () => {
      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'First change',
      })

      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value2',
        newValue: 'value3',
        description: 'Second change',
      })

      expect(historyManager.canUndo()).toBe(true)
    })

    it('should return false after undoing to first change', () => {
      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'First change',
      })

      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value2',
        newValue: 'value3',
        description: 'Second change',
      })

      historyManager.undo()
      historyManager.undo()

      expect(historyManager.canUndo()).toBe(false)
    })
  })

  describe('canRedo', () => {
    it('should return false when no changes recorded', () => {
      expect(historyManager.canRedo()).toBe(false)
    })

    it('should return false when at the end of history', () => {
      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'Test change',
      })

      expect(historyManager.canRedo()).toBe(false)
    })

    it('should return true after undoing a change', () => {
      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'Test change',
      })

      historyManager.undo()

      expect(historyManager.canRedo()).toBe(true)
    })
  })

  describe('getState', () => {
    it('should return correct state information', () => {
      const change1 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'First change',
      }

      const change2 = {
        componentId: 'component-1',
        propertyName: 'color',
        oldValue: 'red',
        newValue: 'blue',
        description: 'Second change',
      }

      historyManager.recordChange(change1)
      historyManager.recordChange(change2)

      const state = historyManager.getState()

      expect(state.canUndo).toBe(true)
      expect(state.canRedo).toBe(false)
      expect(state.currentIndex).toBe(1)
      expect(state.history).toHaveLength(2)
      expect(state.history[0]).toMatchObject(change1)
      expect(state.history[1]).toMatchObject(change2)
    })
  })

  describe('clear', () => {
    it('should clear all history and reset state', () => {
      historyManager.recordChange({
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'Test change',
      })

      historyManager.clear()

      const state = historyManager.getState()
      expect(state.history).toHaveLength(0)
      expect(state.currentIndex).toBe(-1)
      expect(state.canUndo).toBe(false)
      expect(state.canRedo).toBe(false)
    })
  })

  describe('history truncation on new change', () => {
    it('should truncate history when recording change after undo', () => {
      const change1 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'First change',
      }

      const change2 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value2',
        newValue: 'value3',
        description: 'Second change',
      }

      const change3 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value3',
        newValue: 'value4',
        description: 'Third change',
      }

      historyManager.recordChange(change1)
      historyManager.recordChange(change2)
      historyManager.undo()

      // Record new change - should truncate the rest
      historyManager.recordChange(change3)

      const state = historyManager.getState()
      expect(state.history).toHaveLength(2) // change1 and change3
      expect(state.history[0]).toMatchObject(change1)
      expect(state.history[1]).toMatchObject(change3)
      expect(state.currentIndex).toBe(1)
      expect(state.canUndo).toBe(true)
      expect(state.canRedo).toBe(false)
    })
  })

  describe('max history size', () => {
    it('should limit history size to maxHistorySize', () => {
      const maxSize = 5
      const limitedHistoryManager = new (PropertyHistoryManager as any)()
      limitedHistoryManager.maxHistorySize = maxSize

      // Record more changes than the max size
      for (let i = 0; i < maxSize + 3; i++) {
        limitedHistoryManager.recordChange({
          componentId: 'component-1',
          propertyName: 'text',
          oldValue: `value${i}`,
          newValue: `value${i + 1}`,
          description: `Change ${i + 1}`,
        })
      }

      const state = limitedHistoryManager.getState()
      expect(state.history).toHaveLength(maxSize)
      expect(state.currentIndex).toBe(maxSize - 1)
    })
  })

  describe('getHistoryForComponent', () => {
    it('should return history for specific component', () => {
      const change1 = {
        componentId: 'component-1',
        propertyName: 'text',
        oldValue: 'value1',
        newValue: 'value2',
        description: 'Component 1 change',
      }

      const change2 = {
        componentId: 'component-2',
        propertyName: 'text',
        oldValue: 'value3',
        newValue: 'value4',
        description: 'Component 2 change',
      }

      const change3 = {
        componentId: 'component-1',
        propertyName: 'color',
        oldValue: 'red',
        newValue: 'blue',
        description: 'Component 1 another change',
      }

      historyManager.recordChange(change1)
      historyManager.recordChange(change2)
      historyManager.recordChange(change3)

      const component1History = historyManager.getHistoryForComponent('component-1')
      const component2History = historyManager.getHistoryForComponent('component-2')

      expect(component1History).toHaveLength(2)
      expect(component1History[0]).toMatchObject(change1)
      expect(component1History[1]).toMatchObject(change3)

      expect(component2History).toHaveLength(1)
      expect(component2History[0]).toMatchObject(change2)
    })
  })
})

// Integration tests for undo/redo workflow
describe('Undo/Redo Workflow Integration', () => {
  let historyManager: PropertyHistoryManager
  let mockUpdateProperty: jest.Mock

  beforeEach(() => {
    historyManager = new PropertyHistoryManager()
    mockUpdateProperty = jest.fn()
  })

  it('should handle complete undo/redo workflow', () => {
    // Simulate property changes
    const changes = [
      {
        componentId: 'button-1',
        propertyName: 'text',
        oldValue: '',
        newValue: 'Click me',
        description: 'Set button text',
      },
      {
        componentId: 'button-1',
        propertyName: 'color',
        oldValue: 'blue',
        newValue: 'red',
        description: 'Change button color',
      },
      {
        componentId: 'button-1',
        propertyName: 'size',
        oldValue: 'medium',
        newValue: 'large',
        description: 'Change button size',
      },
    ]

    // Record all changes
    changes.forEach(change => historyManager.recordChange(change))

    expect(historyManager.getState().history).toHaveLength(3)

    // Undo all changes
    const undoneChanges = []
    while (historyManager.canUndo()) {
      const change = historyManager.undo()
      if (change) {
        undoneChanges.unshift(change)
        // Simulate applying the undo
        mockUpdateProperty(change.componentId, change.propertyName, change.oldValue)
      }
    }

    expect(undoneChanges).toHaveLength(3)
    expect(mockUpdateProperty).toHaveBeenCalledTimes(3)
    expect(mockUpdateProperty).toHaveBeenNthCalledWith(1, 'button-1', 'size', 'medium')
    expect(mockUpdateProperty).toHaveBeenNthCalledWith(2, 'button-1', 'color', 'blue')
    expect(mockUpdateProperty).toHaveBeenNthCalledWith(3, 'button-1', 'text', '')

    // Redo all changes
    const redoneChanges = []
    while (historyManager.canRedo()) {
      const change = historyManager.redo()
      if (change) {
        redoneChanges.push(change)
        // Simulate applying the redo
        mockUpdateProperty(change.componentId, change.propertyName, change.newValue)
      }
    }

    expect(redoneChanges).toHaveLength(3)
    expect(mockUpdateProperty).toHaveBeenCalledTimes(6)
    expect(mockUpdateProperty).toHaveBeenNthCalledWith(4, 'button-1', 'text', 'Click me')
    expect(mockUpdateProperty).toHaveBeenNthCalledWith(5, 'button-1', 'color', 'red')
    expect(mockUpdateProperty).toHaveBeenNthCalledWith(6, 'button-1', 'size', 'large')
  })

  it('should handle mixed undo and new changes workflow', () => {
    // Record initial changes
    historyManager.recordChange({
      componentId: 'input-1',
      propertyName: 'placeholder',
      oldValue: '',
      newValue: 'Enter text',
      description: 'Set placeholder',
    })

    historyManager.recordChange({
      componentId: 'input-1',
      propertyName: 'required',
      oldValue: false,
      newValue: true,
      description: 'Make required',
    })

    // Undo the last change
    const undoneChange = historyManager.undo()
    expect(undoneChange?.propertyName).toBe('required')

    // Record a new change (should truncate history)
    historyManager.recordChange({
      componentId: 'input-1',
      propertyName: 'maxLength',
      oldValue: null,
      newValue: 100,
      description: 'Set max length',
    })

    const state = historyManager.getState()
    expect(state.history).toHaveLength(2) // placeholder and maxLength
    expect(state.canRedo).toBe(false) // No redo available after truncation

    // Verify history content
    expect(state.history[0].propertyName).toBe('placeholder')
    expect(state.history[1].propertyName).toBe('maxLength')
  })

  it('should handle multiple components independently', () => {
    // Record changes for different components
    historyManager.recordChange({
      componentId: 'button-1',
      propertyName: 'text',
      oldValue: '',
      newValue: 'Submit',
      description: 'Set button text',
    })

    historyManager.recordChange({
      componentId: 'input-1',
      propertyName: 'placeholder',
      oldValue: '',
      newValue: 'Enter name',
      description: 'Set input placeholder',
    })

    historyManager.recordChange({
      componentId: 'button-1',
      propertyName: 'disabled',
      oldValue: false,
      newValue: true,
      description: 'Disable button',
    })

    // Get component-specific histories
    const buttonHistory = historyManager.getHistoryForComponent('button-1')
    const inputHistory = historyManager.getHistoryForComponent('input-1')

    expect(buttonHistory).toHaveLength(2)
    expect(inputHistory).toHaveLength(1)

    // Undo operations should affect all changes
    while (historyManager.canUndo()) {
      historyManager.undo()
    }

    expect(historyManager.getState().canUndo).toBe(false)
    expect(historyManager.getState().canRedo).toBe(true)
  })
})