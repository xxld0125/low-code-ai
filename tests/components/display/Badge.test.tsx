import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageBadge, PageBadgePreview } from '@/components/lowcode/display/Badge/Badge'
import { ComponentRendererProps } from '@/types/page-designer/component'

// 创建标准测试 props 的辅助函数
const createMockProps = (
  overrides: Partial<ComponentRendererProps> = {}
): ComponentRendererProps => ({
  id: 'test-badge',
  type: 'badge' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  props: {},
  styles: {},
  events: {},
  isSelected: false,
  isDragging: false,
  ...overrides,
})

describe('Badge组件', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PageBadge基础渲染', () => {
    test('正确渲染默认徽章组件', () => {
      const mockProps = createMockProps({ id: 'test-badge-1' })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-1"]')
      expect(badgeContainer).toBeInTheDocument()
      expect(badgeContainer).toHaveAttribute('data-component-type', 'badge')
      expect(badgeContainer).toHaveAttribute('role', 'status')
      expect(badgeContainer).toHaveAttribute('aria-label', '徽章')
    })

    test('支持自定义className', () => {
      const mockProps = createMockProps({
        id: 'test-badge-2',
        props: { className: 'custom-badge-class' },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-2"]')
      expect(badgeContainer).toHaveClass('custom-badge-class')
    })

    test('正确渲染默认徽章文本', () => {
      const mockProps = createMockProps({ id: 'test-badge-3' })

      render(<PageBadge {...mockProps} />)

      expect(screen.getByText('徽章')).toBeInTheDocument()
    })
  })

  describe('徽章属性配置', () => {
    test('正确渲染自定义徽章属性', () => {
      const customBadgeProps = {
        text: '自定义徽章',
        variant: 'success',
        size: 'large',
        rounded: true,
      }

      const mockProps = createMockProps({
        id: 'test-badge-4',
        props: { badge: customBadgeProps },
      })

      render(<PageBadge {...mockProps} />)

      expect(screen.getByText('自定义徽章')).toBeInTheDocument()
    })

    test('正确应用primary变体样式', () => {
      const badgeProps = {
        text: 'Primary徽章',
        variant: 'primary',
      }

      const mockProps = createMockProps({
        id: 'test-badge-5',
        props: { badge: badgeProps },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-5"]')
      expect(badgeContainer).toHaveClass('bg-blue-500', 'text-white')
    })

    test('正确应用secondary变体样式', () => {
      const badgeProps = {
        text: 'Secondary徽章',
        variant: 'secondary',
      }

      const mockProps = createMockProps({
        id: 'test-badge-6',
        props: { badge: badgeProps },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-6"]')
      expect(badgeContainer).toHaveClass('bg-gray-100', 'text-gray-700')
    })

    test('正确应用success变体样式', () => {
      const badgeProps = {
        text: 'Success徽章',
        variant: 'success',
      }

      const mockProps = createMockProps({
        id: 'test-badge-7',
        props: { badge: badgeProps },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-7"]')
      expect(badgeContainer).toHaveClass('bg-green-500', 'text-white')
    })

    test('正确应用warning变体样式', () => {
      const badgeProps = {
        text: 'Warning徽章',
        variant: 'warning',
      }

      const mockProps = createMockProps({
        id: 'test-badge-8',
        props: { badge: badgeProps },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-8"]')
      expect(badgeContainer).toHaveClass('bg-yellow-500', 'text-white')
    })

    test('正确应用error变体样式', () => {
      const badgeProps = {
        text: 'Error徽章',
        variant: 'error',
      }

      const mockProps = createMockProps({
        id: 'test-badge-9',
        props: { badge: badgeProps },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-9"]')
      expect(badgeContainer).toHaveClass('bg-red-500', 'text-white')
    })

    test('正确应用outline变体样式', () => {
      const badgeProps = {
        text: 'Outline徽章',
        variant: 'outline',
      }

      const mockProps = createMockProps({
        id: 'test-badge-10',
        props: { badge: badgeProps },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-10"]')
      expect(badgeContainer).toHaveClass('border', 'border-gray-300', 'text-gray-700', 'bg-white')
    })

    test('正确应用尺寸样式', () => {
      const sizeVariants = [
        { size: 'small', class: 'px-2 py-1 text-xs' },
        { size: 'medium', class: 'px-3 py-1 text-sm' },
        { size: 'large', class: 'px-4 py-2 text-base' },
      ]

      sizeVariants.forEach(({ size, class: expectedClass }) => {
        const badgeProps = {
          text: `${size}徽章`,
          size,
        }

        const mockProps = createMockProps({
          id: `test-badge-${size}`,
          props: { badge: badgeProps },
        })

        const { unmount } = render(<PageBadge {...mockProps} />)

        const badgeContainer = document.querySelector(`[data-component-id="test-badge-${size}"]`)
        expectedClass.split(' ').forEach(className => {
          expect(badgeContainer).toHaveClass(className)
        })

        unmount()
      })
    })

    test('正确应用圆角样式', () => {
      const badgeProps = {
        text: '圆角徽章',
        rounded: true,
      }

      const mockProps = createMockProps({
        id: 'test-badge-11',
        props: { badge: badgeProps },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-11"]')
      expect(badgeContainer).toHaveClass('rounded-full')
    })
  })

  describe('样式系统', () => {
    test('正确应用自定义样式', () => {
      const customStyles = {
        width: '120px',
        height: '32px',
        backgroundColor: '#purple',
        border: '1px solid #purple',
        margin: '5px',
        padding: '2px',
      }

      const mockProps = createMockProps({
        id: 'test-badge-12',
        styles: customStyles,
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-12"]')
      expect(badgeContainer).toHaveStyle({
        width: '120px',
        height: '32px',
        border: '1px solid #purple',
        margin: '5px',
        padding: '2px',
      })
    })

    test('过滤不兼容的样式属性', () => {
      const invalidStyles = {
        width: '100px',
        boxShadow: true, // 应该被过滤
        background: {}, // 应该被过滤
        border: [] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        borderRadius: true, // 应该被过滤
        color: '#333', // 应该保留
        fontSize: '14px', // 应该保留
      }

      const mockProps = createMockProps({
        id: 'test-badge-13',
        styles: invalidStyles,
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-13"]')
      expect(badgeContainer).toHaveStyle({
        width: '100px',
        color: '#333',
        fontSize: '14px',
      })
    })
  })

  describe('状态管理', () => {
    test('正确处理选中状态', () => {
      const mockProps = createMockProps({
        id: 'test-badge-14',
        isSelected: true,
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-14"]')
      expect(badgeContainer).toHaveClass('ring-2', 'ring-blue-500', 'ring-offset-2')

      // 检查选中状态指示器
      const selectedIndicator = document.querySelector('.bg-blue-200')
      expect(selectedIndicator).toBeInTheDocument()
    })

    test('正确处理拖拽状态', () => {
      const mockProps = createMockProps({
        id: 'test-badge-15',
        isDragging: true,
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-15"]')
      expect(badgeContainer).toHaveClass('opacity-75')
      expect(badgeContainer).toHaveStyle({ cursor: 'grabbing' })
    })
  })

  describe('事件处理', () => {
    test('正确处理点击事件', async () => {
      const onSelect = jest.fn()
      const mockProps = createMockProps({
        id: 'test-badge-16',
        onSelect,
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-16"]')
      await user.click(badgeContainer!)

      expect(onSelect).toHaveBeenCalledWith('test-badge-16')
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    test('正确处理双击事件', async () => {
      const mockProps = createMockProps({ id: 'test-badge-17' })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-17"]')
      await user.dblClick(badgeContainer!)

      // 双击事件不应该抛出错误
      expect(badgeContainer).toBeInTheDocument()
    })

    test('正确处理键盘事件', async () => {
      const onDelete = jest.fn()
      const mockProps = createMockProps({
        id: 'test-badge-18',
        onDelete,
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector(
        '[data-component-id="test-badge-18"]'
      ) as HTMLElement
      badgeContainer?.focus()
      await user.keyboard('{Delete}')

      expect(onDelete).toHaveBeenCalledWith('test-badge-18')
      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    test('正确处理Backspace键删除', async () => {
      const onDelete = jest.fn()
      const mockProps = createMockProps({
        id: 'test-badge-19',
        onDelete,
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector(
        '[data-component-id="test-badge-19"]'
      ) as HTMLElement
      badgeContainer?.focus()
      await user.keyboard('{Backspace}')

      expect(onDelete).toHaveBeenCalledWith('test-badge-19')
      expect(onDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('可访问性', () => {
    test('支持键盘导航', () => {
      const mockProps = createMockProps({ id: 'test-badge-20' })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-20"]')
      expect(badgeContainer).toHaveAttribute('tabIndex', '0')
    })

    test('具有正确的ARIA属性', () => {
      const badgeProps = {
        text: '自定义徽章文本',
      }

      const mockProps = createMockProps({
        id: 'test-badge-21',
        props: { badge: badgeProps },
      })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-21"]')
      expect(badgeContainer).toHaveAttribute('role', 'status')
      expect(badgeContainer).toHaveAttribute('aria-label', '自定义徽章文本')
    })
  })

  describe('PageBadgePreview组件', () => {
    test('正确渲染预览组件', () => {
      const onClick = jest.fn()
      render(<PageBadgePreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      expect(previewContainer).toBeInTheDocument()
      expect(screen.getByText('徽章')).toBeInTheDocument()
    })

    test('支持点击事件', async () => {
      const onClick = jest.fn()
      render(<PageBadgePreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      await user.click(previewContainer)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('支持键盘交互', async () => {
      const onClick = jest.fn()
      render(<PageBadgePreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      previewContainer.focus()
      await user.keyboard('{Enter}')

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('支持空格键交互', async () => {
      const onClick = jest.fn()
      render(<PageBadgePreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      previewContainer.focus()
      await user.keyboard(' ')

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('具有悬停样式', () => {
      render(<PageBadgePreview />)

      const previewContainer = screen.getByRole('button')
      expect(previewContainer).toHaveClass('hover:border-blue-300', 'hover:bg-blue-50')
    })
  })

  describe('响应式和布局', () => {
    test('正确应用inline-flex布局', () => {
      const mockProps = createMockProps({ id: 'test-badge-22' })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-22"]')
      expect(badgeContainer).toHaveClass('inline-flex')
    })

    test('正确应用居中对齐', () => {
      const mockProps = createMockProps({ id: 'test-badge-23' })

      render(<PageBadge {...mockProps} />)

      const badgeContainer = document.querySelector('[data-component-id="test-badge-23"]')
      expect(badgeContainer).toHaveClass('items-center', 'justify-center')
    })
  })
})
