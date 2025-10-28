import React from 'react'
import type { ComponentInstance, PageDesign } from '@/types/page-designer'

/**
 * 组件渲染器
 * 负责将组件实例渲染为React组件
 */
export class ComponentRenderer {
  /**
   * 渲染单个组件为React元素
   */
  static renderComponent(component: ComponentInstance): React.ReactElement {
    const { component_type, props, styles, id } = component

    // 合并默认样式和自定义样式
    const combinedStyles = {
      ...this.getDefaultStyles(component_type),
      ...styles,
    }

    // 根据组件类型渲染不同的React组件
    switch (component_type) {
      case 'button':
        return this.renderButton(props, combinedStyles, id)
      case 'text':
        return this.renderText(props, combinedStyles, id)
      case 'image':
        return this.renderImage(props, combinedStyles, id)
      case 'container':
        return this.renderContainer(props, combinedStyles, id, undefined)
      case 'input':
        return this.renderInput(props, combinedStyles, id)
      case 'link':
        return this.renderLink(props, combinedStyles, id)
      default:
        return this.renderDefault(component, combinedStyles)
    }
  }

  /**
   * 递归渲染组件树
   */
  static renderComponentTree(
    components: ComponentInstance[],
    rootId: string | null
  ): React.ReactElement[] {
    if (!rootId) {
      // 如果没有根组件，渲染所有顶级组件
      return components.filter(c => !c.parent_id).map(c => this.renderComponent(c))
    }

    // 找到根组件
    const rootComponent = components.find(c => c.id === rootId)
    if (!rootComponent) {
      return []
    }

    // 递归渲染子组件
    return [this.renderComponentWithChildren(rootComponent, components)]
  }

  /**
   * 渲染组件及其子组件
   */
  private static renderComponentWithChildren(
    component: ComponentInstance,
    allComponents: ComponentInstance[]
  ): React.ReactElement {
    // 找到子组件
    const children = allComponents.filter(c => c.parent_id === component.id)

    // 递归渲染子组件
    const renderedChildren = children.map(child =>
      this.renderComponentWithChildren(child, allComponents)
    )

    // 渲染当前组件，传入子组件
    return this.renderComponentWithChildrenProps(component, renderedChildren)
  }

  /**
   * 渲染带子组件的组件
   */
  private static renderComponentWithChildrenProps(
    component: ComponentInstance,
    children: React.ReactElement[]
  ): React.ReactElement {
    const { component_type, props, styles, id } = component
    const combinedStyles = {
      ...this.getDefaultStyles(component_type),
      ...styles,
    }

    switch (component_type) {
      case 'container':
        return this.renderContainer(props, combinedStyles, id, children)
      default:
        // 对于不支持子组件的组件，只渲染自身
        return this.renderComponent(component)
    }
  }

  /**
   * 渲染按钮组件
   */
  private static renderButton(props: any, styles: any, id: string): React.ReactElement {
    const buttonProps = props?.button || {}

    return React.createElement(
      'button',
      {
        key: id,
        style: styles,
        className: `component-${id} ${buttonProps.className || ''}`,
        disabled: buttonProps.disabled,
        type: buttonProps.type || 'button',
      },
      buttonProps.text || '按钮'
    )
  }

  /**
   * 渲染文本组件
   */
  private static renderText(props: any, styles: any, id: string): React.ReactElement {
    const textProps = props?.text || {}
    const Tag = textProps.tag || 'div'

    return React.createElement(
      Tag,
      {
        key: id,
        style: styles,
        className: `component-${id} ${textProps.className || ''}`,
      },
      textProps.content || '文本内容'
    )
  }

  /**
   * 渲染图片组件
   */
  private static renderImage(props: any, styles: any, id: string): React.ReactElement {
    const imageProps = props?.image || {}

    return React.createElement('img', {
      key: id,
      style: styles,
      className: `component-${id} ${imageProps.className || ''}`,
      src: imageProps.src || '',
      alt: imageProps.alt || '',
      width: imageProps.width,
      height: imageProps.height,
    })
  }

  /**
   * 渲染容器组件
   */
  private static renderContainer(
    props: any,
    styles: any,
    id: string,
    children: React.ReactNode
  ): React.ReactElement {
    const containerProps = props?.container || {}
    const Tag = containerProps.tag || 'div'

    return React.createElement(
      Tag,
      {
        key: id,
        style: styles,
        className: `component-${id} ${containerProps.className || ''}`,
      },
      children
    )
  }

  /**
   * 渲染输入框组件
   */
  private static renderInput(props: any, styles: any, id: string): React.ReactElement {
    const inputProps = props?.input || {}

    return React.createElement('input', {
      key: id,
      style: styles,
      className: `component-${id} ${inputProps.className || ''}`,
      type: inputProps.type || 'text',
      placeholder: inputProps.placeholder,
      value: inputProps.value || '',
      disabled: inputProps.disabled,
      readOnly: inputProps.readOnly,
    })
  }

  /**
   * 渲染链接组件
   */
  private static renderLink(props: any, styles: any, id: string): React.ReactElement {
    const linkProps = props?.link || {}

    return React.createElement(
      'a',
      {
        key: id,
        style: styles,
        className: `component-${id} ${linkProps.className || ''}`,
        href: linkProps.href || '#',
        target: linkProps.target || '_self',
      },
      linkProps.text || '链接'
    )
  }

  /**
   * 渲染默认组件
   */
  private static renderDefault(component: ComponentInstance, styles: any): React.ReactElement {
    return React.createElement(
      'div',
      {
        key: component.id,
        style: styles,
        className: `component-${component.id}`,
      },
      `<!-- ${component.component_type} -->`
    )
  }

  /**
   * 获取组件的默认样式
   */
  private static getDefaultStyles(componentType: string): any {
    const defaultStyles = {
      button: {
        padding: '8px 16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f0f0f0',
        cursor: 'pointer',
        fontSize: '14px',
      },
      text: {
        margin: '0',
        padding: '4px 0',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      image: {
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
      },
      container: {
        padding: '16px',
        border: '1px dashed #ccc',
        borderRadius: '4px',
      },
      input: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
      },
      link: {
        color: '#0066cc',
        textDecoration: 'underline',
        cursor: 'pointer',
      },
    }

    return defaultStyles[componentType as keyof typeof defaultStyles] || {}
  }

  /**
   * 应用页面级样式
   */
  static applyPageStyles(pageDesign: PageDesign): React.CSSProperties {
    const config = pageDesign.config || {}
    const styles = config.styles || {}
    const layout = config.layout || {}

    return {
      backgroundColor: (styles as any)?.backgroundColor || '#ffffff',
      backgroundImage: (styles as any)?.backgroundImage
        ? `url(${(styles as any).backgroundImage})`
        : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      lineHeight: '1.6',
      color: '#333',
      margin: 0,
      padding: (layout as any)?.padding
        ? `${(layout as any).padding.top}px ${(layout as any).padding.right}px ${(layout as any).padding.bottom}px ${(layout as any).padding.left}px`
        : '20px',
      maxWidth: (layout as any)?.maxWidth ? `${(layout as any).maxWidth}px` : '100%',
      minHeight: '100vh',
    }
  }
}
