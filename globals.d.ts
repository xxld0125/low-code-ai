/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveClass(...classNames: string[]): R
      toHaveStyle(style: Record<string, string>): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeChecked(): R
      toBeEmptyDOMElement(): R
      toBeInTheDocument(): R
      toHaveFocus(): R
      toHaveFormValues(expectedValues: Record<string, unknown>): R
      toBePartiallyChecked(): R
      toHaveDescription(text: string | RegExp): R
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R
      toHaveErrorMessage(text: string | RegExp): R
      toHaveRole(role: string): R
      toHaveAccessibleDescription(): R
      toHaveAccessibleName(): R
      toBeInvalid(): R
      toBeRequired(): R
      toBeValid(): R
      toHaveValue(value: string | string[]): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      // 自定义匹配器
      toHaveComponent(componentType: string): R
      toHaveComponentWithProps(componentType: string, props: Record<string, unknown>): R
      toBeValidComponent(): R
      toHaveCorrectProps(expectedProps: Record<string, unknown>): R
    }
  }
}

export {}
