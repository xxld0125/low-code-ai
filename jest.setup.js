import '@testing-library/jest-dom'
import '../jest.types'

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
}))

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
