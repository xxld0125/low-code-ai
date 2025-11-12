/**
 * shadcn/ui组件自定义主题
 * 为属性配置面板组件提供专门的样式定制
 */

// 主题配置接口
export interface PropertyPanelTheme {
  components: {
    button: {
      default: string
      primary: string
      secondary: string
      outline: string
      ghost: string
      destructive: string
    }
    input: {
      default: string
      focused: string
      error: string
      disabled: string
    }
    card: {
      default: string
      elevated: string
      bordered: string
      interactive: string
    }
    label: {
      default: string
      required: string
      disabled: string
    }
    switch: {
      default: string
      checked: string
      disabled: string
    }
    slider: {
      default: string
      focused: string
      disabled: string
    }
    select: {
      default: string
      focused: string
      error: string
      disabled: string
    }
    textarea: {
      default: string
      focused: string
      error: string
      disabled: string
    }
    checkbox: {
      default: string
      checked: string
      disabled: string
    }
    badge: {
      default: string
      primary: string
      secondary: string
      success: string
      warning: string
      error: string
      outline: string
    }
  }
}

/**
 * 属性配置面板专用主题
 */
export const propertyPanelTheme: PropertyPanelTheme = {
  components: {
    button: {
      default:
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4',
      primary:
        'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 focus:ring-blue-500',
      secondary:
        'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200 hover:border-gray-300 focus:ring-gray-500',
      outline:
        'border-2 border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-700 focus:ring-gray-500',
      destructive:
        'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 focus:ring-red-500',
    },
    input: {
      default:
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      focused: 'ring-2 ring-blue-500 border-blue-500 focus:ring-blue-500 focus:border-blue-500',
      error:
        'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300',
      disabled: 'opacity-50 cursor-not-allowed bg-gray-50',
    },
    card: {
      default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
      elevated:
        'rounded-lg border bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-200',
      bordered: 'rounded-lg border-2 border-gray-200 bg-card text-card-foreground',
      interactive:
        'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer',
    },
    label: {
      default:
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      required:
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 after:content-[\"*\"] after:ml-0.5 after:text-red-500',
      disabled:
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-gray-400',
    },
    switch: {
      default:
        'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      checked: 'bg-blue-600 border-blue-600',
      disabled: 'opacity-50 cursor-not-allowed bg-gray-200 border-gray-300',
    },
    slider: {
      default: 'relative flex w-full touch-none select-none items-center',
      focused:
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    select: {
      default:
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      focused: 'ring-2 ring-blue-500 border-blue-500 focus:ring-blue-500 focus:border-blue-500',
      error: 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-900',
      disabled: 'opacity-50 cursor-not-allowed bg-gray-50',
    },
    textarea: {
      default:
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      focused: 'ring-2 ring-blue-500 border-blue-500 focus:ring-blue-500 focus:border-blue-500',
      error:
        'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300',
      disabled: 'opacity-50 cursor-not-allowed bg-gray-50',
    },
    checkbox: {
      default:
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      checked: 'bg-blue-600 border-blue-600 text-white',
      disabled: 'opacity-50 cursor-not-allowed bg-gray-200 border-gray-300',
    },
    badge: {
      default:
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      primary: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
      success: 'border-transparent bg-green-600 text-white hover:bg-green-700',
      warning: 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700',
      error: 'border-transparent bg-red-600 text-white hover:bg-red-700',
      outline: 'text-gray-900 border-gray-300 hover:bg-gray-100',
    },
  },
}

/**
 * 获取组件样式的辅助函数
 */
export function getComponentStyles(
  component: keyof PropertyPanelTheme['components'],
  variant: string = 'default'
): string {
  const componentStyles = propertyPanelTheme.components[component]

  if (!componentStyles) {
    console.warn(`Component styles not found for: ${component}`)
    return ''
  }

  const variantStyle = componentStyles[variant as keyof typeof componentStyles]

  if (!variantStyle) {
    console.warn(`Variant "${variant}" not found for component: ${component}`)
    return componentStyles.default || ''
  }

  return variantStyle
}

/**
 * 响应式设计令牌
 */
export const responsiveTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
}

/**
 * 暗色主题配置
 */
export const darkTheme = {
  components: {
    ...propertyPanelTheme.components,
    input: {
      ...propertyPanelTheme.components.input,
      default:
        'flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50',
      focused:
        'ring-2 ring-blue-500 border-blue-500 focus:ring-blue-500 focus:border-blue-500 bg-gray-800',
      error:
        'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-300 placeholder-red-400 bg-gray-800',
      disabled: 'opacity-50 cursor-not-allowed bg-gray-900',
    },
    card: {
      default: 'rounded-lg border border-gray-700 bg-gray-800 text-white shadow-sm',
      elevated:
        'rounded-lg border border-gray-700 bg-gray-800 text-white shadow-md hover:shadow-lg transition-shadow duration-200',
      bordered: 'rounded-lg border-2 border-gray-600 bg-gray-800 text-white',
      interactive:
        'rounded-lg border border-gray-700 bg-gray-800 text-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-500 cursor-pointer',
    },
    button: {
      ...propertyPanelTheme.components.button,
      secondary:
        'bg-gray-700 hover:bg-gray-600 text-white border-gray-600 hover:border-gray-500 focus:ring-gray-500',
    },
  },
}

export default propertyPanelTheme
