import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
        in: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  const MockedImage = ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  )
  MockedImage.displayName = 'MockedImage'
  return MockedImage
})

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="icon-plus">+</div>,
  Search: () => <div data-testid="icon-search">🔍</div>,
  MoreHorizontal: () => <div data-testid="icon-more">⋯</div>,
  Eye: () => <div data-testid="icon-eye">👁</div>,
  Edit: () => <div data-testid="icon-edit">✏</div>,
  Trash2: () => <div data-testid="icon-trash">🗑</div>,
  Database: () => <div data-testid="icon-database">🗄</div>,
  RotateCcw: () => <div data-testid="icon-rotate-ccw">🔄</div>,
  Save: () => <div data-testid="icon-save">💾</div>,
  Settings: () => <div data-testid="icon-settings">⚙️</div>,
  Play: () => <div data-testid="icon-play">▶️</div>,
  Pause: () => <div data-testid="icon-pause">⏸️</div>,
  Smartphone: () => <div data-testid="icon-smartphone">📱</div>,
  Tablet: () => <div data-testid="icon-tablet">📱</div>,
  Monitor: () => <div data-testid="icon-monitor">🖥️</div>,
  Maximize2: () => <div data-testid="icon-maximize2">⛶</div>,
  SplitSquareVertical: () => <div data-testid="icon-split">⚊</div>,
}))

// Mock Radix UI components
jest.mock('@radix-ui/react-slot', () => {
  const React = require('react')
  const Slot = React.forwardRef(({ children, ...props }, ref) =>
    React.createElement('div', { ...props, ref }, children)
  )
  Slot.displayName = 'Slot'
  return { Slot }
})

// Mock other Radix UI primitives
jest.mock('@radix-ui/react-label', () => {
  const React = require('react')
  const Label = React.forwardRef(({ className, ...props }, ref) =>
    React.createElement('label', { ...props, ref, className })
  )
  Label.displayName = 'Label'
  const LabelPrimitive = {
    Root: React.forwardRef(({ ...props }, ref) =>
      React.createElement('label', { ...props, ref })
    )
  }
  LabelPrimitive.Root.displayName = 'Label.Root'
  return {
    LabelPrimitive,
    Label
  }
})

jest.mock('@radix-ui/react-select', () => {
  const React = require('react')
  const Select = {
    Root: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('div', { ...props, ref }, children)
    ),
    Trigger: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('button', { ...props, ref }, children)
    ),
    Value: React.forwardRef(({ ...props }, ref) =>
      React.createElement('span', { ...props, ref })
    ),
    Content: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('div', { ...props, ref }, children)
    ),
    Item: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('div', { ...props, ref }, children)
    ),
  }
  Object.keys(Select).forEach(key => {
    Select[key].displayName = `Select.${key}`
  })
  return Select
})

jest.mock('@radix-ui/react-tabs', () => {
  const React = require('react')
  const Tabs = {
    Root: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('div', { ...props, ref }, children)
    ),
    List: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('div', { ...props, ref }, children)
    ),
    Trigger: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('button', { ...props, ref }, children)
    ),
    Content: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('div', { ...props, ref }, children)
    ),
  }
  Object.keys(Tabs).forEach(key => {
    Tabs[key].displayName = `Tabs.${key}`
  })
  return Tabs
})

// Global test timeout
jest.setTimeout(10000)

// Add custom matchers for component testing
expect.extend({
  toHaveComponent(received, componentType) {
    const pass = received.type === componentType
    return {
      message: () => `expected ${received.type} ${pass ? 'not ' : ''}to be ${componentType}`,
      pass,
    }
  },

  toHaveComponentWithProps(received, componentType, props) {
    const isCorrectType = received.type === componentType
    const hasCorrectProps = Object.entries(props).every(
      ([key, value]) => received.props[key] === value
    )
    const pass = isCorrectType && hasCorrectProps

    return {
      message: () =>
        `expected component ${pass ? 'not ' : ''}to be ${componentType} with props ${JSON.stringify(props)}`,
      pass,
    }
  },
})
