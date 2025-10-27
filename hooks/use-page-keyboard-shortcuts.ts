/**
 * 页面设计器键盘快捷键Hook
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import { useEffect, useCallback, useRef } from 'react'
import { useSelectionStore } from '@/stores/page-designer/selection-store'

// 快捷键配置接口
export interface KeyboardShortcutConfig {
  enabled?: boolean
  globalScope?: boolean // 是否在全局范围内监听
  preventDefault?: boolean // 是否阻止默认行为
}

// 快捷键动作类型
export type ShortcutAction =
  | 'delete'
  | 'copy'
  | 'paste'
  | 'cut'
  | 'duplicate'
  | 'undo'
  | 'redo'
  | 'selectAll'
  | 'deselectAll'
  | 'selectNext'
  | 'selectPrevious'
  | 'selectParent'
  | 'selectChildren'
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'resetZoom'
  | 'toggleGrid'
  | 'save'
  | 'export'
  | 'preview'

// 快捷键处理器接口
export interface ShortcutHandlers {
  onDelete?: () => void
  onCopy?: (selectedIds: string[]) => void
  onPaste?: () => void
  onCut?: (selectedIds: string[]) => void
  onDuplicate?: (selectedIds: string[]) => void
  onUndo?: () => void
  onRedo?: () => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  onSelectNext?: () => void
  onSelectPrevious?: () => void
  onSelectParent?: () => void
  onSelectChildren?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
  onToggleGrid?: () => void
  onSave?: () => void
  onExport?: () => void
  onPreview?: () => void
}

// 快捷键映射
const SHORTCUT_MAP: Record<string, ShortcutAction> = {
  // 基础编辑
  Delete: 'delete',
  Backspace: 'delete',

  // 复制粘贴 (Windows/Linux)
  c: 'copy',
  v: 'paste',
  x: 'cut',
  d: 'duplicate',
  z: 'undo',
  y: 'redo',
  a: 'selectAll',

  // 导航
  ArrowUp: 'moveUp',
  ArrowDown: 'moveDown',
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  Tab: 'selectNext',
  Enter: 'selectChildren',

  // 功能键
  s: 'save',
  e: 'export',
  p: 'preview',
  g: 'toggleGrid',
  '=': 'zoomIn',
  '-': 'zoomOut',
  '0': 'resetZoom',
  Escape: 'deselectAll',
}

// 组合键映射
const COMBO_SHORTCUTS: Record<string, ShortcutAction> = {
  // 复制粘贴 (Windows/Linux)
  'ctrl+c': 'copy',
  'ctrl+v': 'paste',
  'ctrl+x': 'cut',
  'ctrl+d': 'duplicate',
  'ctrl+z': 'undo',
  'ctrl+y': 'redo',
  'ctrl+a': 'selectAll',
  'ctrl+s': 'save',

  // 复制粘贴 (Mac)
  'meta+c': 'copy',
  'meta+v': 'paste',
  'meta+x': 'cut',
  'meta+d': 'duplicate',
  'meta+z': 'undo',
  'meta+shift+z': 'redo',
  'meta+y': 'redo',
  'meta+a': 'selectAll',
  'meta+s': 'save',

  // 导航组合键
  'shift+tab': 'selectPrevious',
  'ctrl+shift+a': 'deselectAll',

  // 缩放
  'ctrl+plus': 'zoomIn',
  'ctrl+minus': 'zoomOut',
  'ctrl+0': 'resetZoom',
  'meta+plus': 'zoomIn',
  'meta+minus': 'zoomOut',
  'meta+0': 'resetZoom',

  // 功能
  'ctrl+g': 'toggleGrid',
  'meta+g': 'toggleGrid',
  'ctrl+e': 'export',
  'meta+e': 'export',
  'ctrl+p': 'preview',
  'meta+p': 'preview',
}

// 生成组合键字符串
const getComboKey = (e: KeyboardEvent): string => {
  const parts: string[] = []

  if (e.ctrlKey) parts.push('ctrl')
  if (e.metaKey) parts.push('meta')
  if (e.altKey) parts.push('alt')
  if (e.shiftKey) parts.push('shift')

  // 处理特殊键
  let key = e.key.toLowerCase()
  if (key === ' ') key = 'space'
  if (key === 'escape') key = 'escape'
  if (key.startsWith('arrow')) key = key.replace('arrow', '')
  if (key === '+') key = 'plus'
  if (key === '=') key = 'plus'
  if (key === '-') key = 'minus'

  parts.push(key)

  return parts.join('+')
}

// 检查是否应该忽略快捷键的元素
const shouldIgnoreShortcut = (target: EventTarget | null): boolean => {
  if (!target) return false

  const element = target as HTMLElement

  // 检查是否在输入元素中
  const inputElements = ['input', 'textarea', 'select']
  if (inputElements.includes(element.tagName.toLowerCase())) {
    return true
  }

  // 检查是否有contenteditable属性
  if (element.contentEditable === 'true') {
    return true
  }

  // 检查是否在设计器特定的输入区域
  if (element.closest('.property-editor, .input-field, .text-editor')) {
    return true
  }

  return false
}

export const usePageKeyboardShortcuts = (
  handlers: ShortcutHandlers,
  config: KeyboardShortcutConfig = {},
  additionalDependencies: any[] = []
) => {
  const { enabled = true, globalScope = false, preventDefault = true } = config

  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  // 获取选择状态
  const selectedIds = useSelectionStore(state => state.getSelectedIds())
  const hasSelection = selectedIds.length > 0

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // 检查是否应该忽略此快捷键
      if (shouldIgnoreShortcut(event.target)) {
        return
      }

      // 获取组合键字符串
      const comboKey = getComboKey(event)

      // 查找对应的动作
      let action: ShortcutAction | undefined = COMBO_SHORTCUTS[comboKey]

      // 如果没有找到组合键，检查单个键
      if (!action && !event.ctrlKey && !event.metaKey && !event.altKey) {
        action = SHORTCUT_MAP[event.key]
      }

      // 如果没有找到动作，返回
      if (!action) return

      // 阻止默认行为
      if (preventDefault) {
        event.preventDefault()
        event.stopPropagation()
      }

      // 执行对应的处理器
      const currentHandlers = handlersRef.current
      let handled = false

      switch (action) {
        case 'delete':
          if (hasSelection && currentHandlers.onDelete) {
            currentHandlers.onDelete()
            handled = true
          }
          break

        case 'copy':
          if (hasSelection && currentHandlers.onCopy) {
            currentHandlers.onCopy(selectedIds)
            handled = true
          }
          break

        case 'paste':
          if (currentHandlers.onPaste) {
            currentHandlers.onPaste()
            handled = true
          }
          break

        case 'cut':
          if (hasSelection && currentHandlers.onCut) {
            currentHandlers.onCut(selectedIds)
            handled = true
          }
          break

        case 'duplicate':
          if (hasSelection && currentHandlers.onDuplicate) {
            currentHandlers.onDuplicate(selectedIds)
            handled = true
          }
          break

        case 'undo':
          if (currentHandlers.onUndo) {
            currentHandlers.onUndo()
            handled = true
          }
          break

        case 'redo':
          if (currentHandlers.onRedo) {
            currentHandlers.onRedo()
            handled = true
          }
          break

        case 'selectAll':
          if (currentHandlers.onSelectAll) {
            currentHandlers.onSelectAll()
            handled = true
          }
          break

        case 'deselectAll':
          if (currentHandlers.onDeselectAll) {
            currentHandlers.onDeselectAll()
            handled = true
          }
          break

        case 'selectNext':
          if (currentHandlers.onSelectNext) {
            currentHandlers.onSelectNext()
            handled = true
          }
          break

        case 'selectPrevious':
          if (currentHandlers.onSelectPrevious) {
            currentHandlers.onSelectPrevious()
            handled = true
          }
          break

        case 'selectParent':
          if (hasSelection && currentHandlers.onSelectParent) {
            currentHandlers.onSelectParent()
            handled = true
          }
          break

        case 'selectChildren':
          if (hasSelection && currentHandlers.onSelectChildren) {
            currentHandlers.onSelectChildren()
            handled = true
          }
          break

        case 'moveUp':
          if (hasSelection && currentHandlers.onMoveUp) {
            currentHandlers.onMoveUp()
            handled = true
          }
          break

        case 'moveDown':
          if (hasSelection && currentHandlers.onMoveDown) {
            currentHandlers.onMoveDown()
            handled = true
          }
          break

        case 'moveLeft':
          if (hasSelection && currentHandlers.onMoveLeft) {
            currentHandlers.onMoveLeft()
            handled = true
          }
          break

        case 'moveRight':
          if (hasSelection && currentHandlers.onMoveRight) {
            currentHandlers.onMoveRight()
            handled = true
          }
          break

        case 'zoomIn':
          if (currentHandlers.onZoomIn) {
            currentHandlers.onZoomIn()
            handled = true
          }
          break

        case 'zoomOut':
          if (currentHandlers.onZoomOut) {
            currentHandlers.onZoomOut()
            handled = true
          }
          break

        case 'resetZoom':
          if (currentHandlers.onResetZoom) {
            currentHandlers.onResetZoom()
            handled = true
          }
          break

        case 'toggleGrid':
          if (currentHandlers.onToggleGrid) {
            currentHandlers.onToggleGrid()
            handled = true
          }
          break

        case 'save':
          if (currentHandlers.onSave) {
            currentHandlers.onSave()
            handled = true
          }
          break

        case 'export':
          if (currentHandlers.onExport) {
            currentHandlers.onExport()
            handled = true
          }
          break

        case 'preview':
          if (currentHandlers.onPreview) {
            currentHandlers.onPreview()
            handled = true
          }
          break
      }

      // 如果没有处理器，使用selection store的默认行为
      if (!handled) {
        const selectionStore = useSelectionStore.getState()

        switch (action) {
          case 'delete':
            if (hasSelection) {
              // 删除操作需要在主组件中处理
              console.log('Delete shortcut triggered, but no handler provided')
            }
            break

          case 'copy':
            if (hasSelection) {
              // 复制到剪贴板
              const components = selectedIds.map(id => ({ id }))
              selectionStore.copy(components)
            }
            break

          case 'paste':
            // 从剪贴板粘贴
            selectionStore.paste({ x: 0, y: 0 })
            break

          case 'selectAll':
            // 需要传入组件列表，这里只是示例
            console.log('Select all shortcut triggered, but no handler provided')
            break

          case 'deselectAll':
            selectionStore.clearSelection()
            break

          case 'duplicate':
            if (hasSelection) {
              const newIds = selectionStore.duplicate(selectedIds)
              console.log('Duplicated components:', newIds)
            }
            break
        }
      }
    },
    [enabled, preventDefault, hasSelection, selectedIds]
  )

  // 设置事件监听
  useEffect(() => {
    if (!enabled) return

    const element = globalScope ? document : window

    element.addEventListener('keydown', handleKeyDown as EventListener, true)

    return () => {
      element.removeEventListener('keydown', handleKeyDown as EventListener, true)
    }
  }, [handleKeyDown, enabled, globalScope])

  // 返回快捷键状态信息
  return {
    isShortcutsEnabled: enabled,
    hasSelection,
    selectedCount: selectedIds.length,
  }
}

// 便捷Hook：用于页面设计器的默认快捷键
export const usePageDesignerShortcuts = (
  additionalHandlers: Partial<ShortcutHandlers> = {},
  config?: KeyboardShortcutConfig
) => {
  // 这里可以添加页面设计器特定的默认处理器
  const defaultHandlers: ShortcutHandlers = {
    // 默认处理器可以从context或其他store获取
    ...additionalHandlers,
  }

  return usePageKeyboardShortcuts(defaultHandlers, config, Object.values(additionalHandlers))
}

export default usePageKeyboardShortcuts
