import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageCard, PageCardPreview } from '@/components/lowcode/display/Card/Card'
import { ComponentRendererProps } from '@/types/page-designer/component'

// Card 组件属性类型定义
interface CardProps {
  title?: string
  content?: string
  footer?: string
  variant?: 'default' | 'outlined' | 'elevated'
  size?: 'small' | 'medium' | 'large'
  padding?: number | string
  shadow?: boolean
  rounded?: boolean
}

// 创建标准测试 props 的辅助函数
const createMockProps = (
  overrides: Partial<ComponentRendererProps> = {}
): ComponentRendererProps => ({
  id: 'test-card',
  type: 'card',
  props: {},
  styles: {},
  events: {},
  isSelected: false,
  isDragging: false,
  ...overrides,
})

describe('Card组件', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PageCard基础渲染', () => {
    test('正确渲染默认卡片组件', () => {
      const mockProps = createMockProps({ id: 'test-card-1' })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-1"]')
      expect(cardContainer).toBeInTheDocument()
      expect(cardContainer).toHaveAttribute('data-component-type', 'card')
      expect(cardContainer).toHaveAttribute('role', 'article')
      expect(cardContainer).toHaveAttribute('aria-label', '卡片标题')
    })

    test('支持自定义className', () => {
      const mockProps = createMockProps({
        id: 'test-card-2',
        props: { className: 'custom-card-class' },
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-2"]')
      expect(cardContainer).toHaveClass('custom-card-class')
    })

    test('正确渲染默认卡片内容', () => {
      const mockProps = createMockProps({ id: 'test-card-3' })

      render(<PageCard {...mockProps} />)

      expect(screen.getByText('卡片标题')).toBeInTheDocument()
      expect(screen.getByText('卡片描述内容')).toBeInTheDocument()
    })
  })

  describe('卡片属性配置', () => {
    test('正确渲染自定义卡片属性', () => {
      const customCardProps = {
        title: '自定义标题',
        description: '自定义描述内容',
        variant: 'elevated',
        padding: 'large',
        shadow: true,
        rounded: true,
        border: false,
      }

      const mockProps = createMockProps({
        id: 'test-card-4',
        props: { card: customCardProps as CardProps },
      })

      render(<PageCard {...mockProps} />)

      expect(screen.getByText('自定义标题')).toBeInTheDocument()
      expect(screen.getByText('自定义描述内容')).toBeInTheDocument()
    })

    test('正确应用变体样式', () => {
      const cardProps = {
        title: '测试卡片',
        description: '测试描述',
        variant: 'outlined',
      }

      const mockProps = createMockProps({
        id: 'test-card-5',
        props: { card: cardProps as CardProps },
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-5"]')
      expect(cardContainer).toHaveClass('border', 'border-gray-200', 'bg-white')
    })

    test('正确应用内边距样式', () => {
      const cardProps = {
        title: '测试卡片',
        padding: 'large',
      }

      const mockProps = createMockProps({
        id: 'test-card-6',
        props: { card: cardProps as CardProps },
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-6"]')
      expect(cardContainer).toHaveClass('p-6')
    })

    test('正确应用圆角样式', () => {
      const cardProps = {
        title: '测试卡片',
        rounded: true,
      }

      const mockProps = createMockProps({
        id: 'test-card-7',
        props: { card: cardProps as CardProps },
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-7"]')
      expect(cardContainer).toHaveClass('rounded-lg')
    })

    test('正确应用阴影样式', () => {
      const cardProps = {
        title: '测试卡片',
        shadow: true,
      }

      const mockProps = createMockProps({
        id: 'test-card-8',
        props: { card: cardProps as CardProps },
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-8"]')
      expect(cardContainer).toHaveClass('shadow-md')
    })
  })

  describe('样式系统', () => {
    test('正确应用自定义样式', () => {
      const customStyles = {
        width: '400px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #dee2e6',
        margin: '20px',
        padding: '15px',
      }

      const mockProps = createMockProps({
        id: 'test-card-9',
        styles: customStyles,
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-9"]')
      expect(cardContainer).toHaveStyle({
        width: '400px',
        border: '2px solid #dee2e6',
        margin: '20px',
        padding: '15px',
      })
    })

    test('过滤不兼容的样式属性', () => {
      const invalidStyles = {
        width: '300px',
        boxShadow: true, // 应该被过滤
        background: {}, // 应该被过滤
        border: [] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        borderRadius: true, // 应该被过滤
        color: '#333', // 应该保留
        fontSize: '16px', // 应该保留
      }

      const mockProps = createMockProps({
        id: 'test-card-10',
        styles: invalidStyles,
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-10"]')
      expect(cardContainer).toHaveStyle({
        width: '300px',
        color: '#333',
        fontSize: '16px',
      })
    })
  })

  describe('状态管理', () => {
    test('正确处理选中状态', () => {
      const mockProps = createMockProps({
        id: 'test-card-11',
        isSelected: true,
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-11"]')
      expect(cardContainer).toHaveClass('ring-2', 'ring-blue-500', 'ring-offset-2')

      // 检查选中状态指示器
      const selectedIndicator = screen.getByText('卡片')
      expect(selectedIndicator).toBeInTheDocument()
      expect(selectedIndicator).toHaveClass('text-white')
    })

    test('正确处理拖拽状态', () => {
      const mockProps = createMockProps({
        id: 'test-card-12',
        isDragging: true,
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-12"]')
      expect(cardContainer).toHaveClass('opacity-75')
      expect(cardContainer).toHaveStyle({ cursor: 'grabbing' })
    })
  })

  describe('事件处理', () => {
    test('正确处理点击事件', async () => {
      const onSelect = jest.fn()
      const mockProps = createMockProps({
        id: 'test-card-13',
        onSelect,
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-13"]')
      await user.click(cardContainer!)

      expect(onSelect).toHaveBeenCalledWith('test-card-13')
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    test('正确处理双击事件', async () => {
      const mockProps = createMockProps({ id: 'test-card-14' })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-14"]')
      await user.dblClick(cardContainer!)

      // 双击事件不应该抛出错误
      expect(cardContainer).toBeInTheDocument()
    })

    test('正确处理键盘事件', async () => {
      const onDelete = jest.fn()
      const mockProps = createMockProps({
        id: 'test-card-15',
        onDelete,
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector(
        '[data-component-id="test-card-15"]'
      ) as HTMLElement
      cardContainer?.focus()
      await user.keyboard('{Delete}')

      expect(onDelete).toHaveBeenCalledWith('test-card-15')
      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    test('正确处理Backspace键删除', async () => {
      const onDelete = jest.fn()
      const mockProps = createMockProps({
        id: 'test-card-16',
        onDelete,
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector(
        '[data-component-id="test-card-16"]'
      ) as HTMLElement
      cardContainer?.focus()
      await user.keyboard('{Backspace}')

      expect(onDelete).toHaveBeenCalledWith('test-card-16')
      expect(onDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('内容渲染', () => {
    test('正确处理空标题的情况', () => {
      const cardProps = {
        title: '',
        description: '只有描述的卡片',
      }

      const mockProps = createMockProps({
        id: 'test-card-17',
        props: { card: cardProps as CardProps },
      })

      render(<PageCard {...mockProps} />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
      expect(screen.getByText('只有描述的卡片')).toBeInTheDocument()
    })

    test('正确处理空描述的情况', () => {
      const cardProps = {
        title: '只有标题的卡片',
        description: '',
      }

      const mockProps = createMockProps({
        id: 'test-card-18',
        props: { card: cardProps as CardProps },
      })

      render(<PageCard {...mockProps} />)

      expect(screen.getByText('只有标题的卡片')).toBeInTheDocument()
      expect(screen.getByText('卡片内容区域')).toBeInTheDocument()
    })

    test('正确渲染子组件', () => {
      const mockProps = createMockProps({
        id: 'test-card-19',
        props: {
          card: {
            title: '带操作的卡片',
            description: '卡片描述',
          },
          children: <button>操作按钮</button>,
        },
      })

      render(<PageCard {...mockProps} />)

      expect(screen.getByText('带操作的卡片')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '操作按钮' })).toBeInTheDocument()
    })
  })

  describe('可访问性', () => {
    test('支持键盘导航', () => {
      const mockProps = createMockProps({ id: 'test-card-20' })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-20"]')
      expect(cardContainer).toHaveAttribute('tabIndex', '0')
    })

    test('具有正确的ARIA属性', () => {
      const cardProps = {
        title: '自定义卡片标题',
        description: '自定义卡片描述',
      }

      const mockProps = createMockProps({
        id: 'test-card-21',
        props: { card: cardProps as CardProps },
      })

      render(<PageCard {...mockProps} />)

      const cardContainer = document.querySelector('[data-component-id="test-card-21"]')
      expect(cardContainer).toHaveAttribute('role', 'article')
      expect(cardContainer).toHaveAttribute('aria-label', '自定义卡片标题')
    })
  })

  describe('PageCardPreview组件', () => {
    test('正确渲染预览组件', () => {
      const onClick = jest.fn()
      render(<PageCardPreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      expect(previewContainer).toBeInTheDocument()
      expect(document.querySelector('.bg-gray-300')).toBeInTheDocument()
      expect(document.querySelector('.bg-gray-400')).toBeInTheDocument()
    })

    test('支持点击事件', async () => {
      const onClick = jest.fn()
      render(<PageCardPreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      await user.click(previewContainer)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('支持键盘交互', async () => {
      const onClick = jest.fn()
      render(<PageCardPreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      previewContainer.focus()
      await user.keyboard('{Enter}')

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('支持空格键交互', async () => {
      const onClick = jest.fn()
      render(<PageCardPreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      previewContainer.focus()
      await user.keyboard(' ')

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('具有悬停样式', () => {
      render(<PageCardPreview />)

      const previewContainer = screen.getByRole('button')
      expect(previewContainer).toHaveClass('hover:border-blue-300', 'hover:bg-blue-50')
    })
  })
})
