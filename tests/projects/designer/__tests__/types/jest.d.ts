/**
 * Jest DOM matchers type declarations
 * Extends Jest matchers with @testing-library/jest-dom matchers
 */

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
      toBeEmpty(): R
      toBeInTheDocument(): R
      toHaveFocus(): R
      toHaveFormValues(expectedValues: Record<string, unknown>): R
      toBePartiallyChecked(): R
      toHaveDescription(text: string | RegExp): R
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R
      toHaveErrorMessage(text: string | RegExp): R
      toHaveRole(role: string): R
      toHaveAccessibleDescription(text: string | RegExp): R
      toHaveAccessibleName(text: string | RegExp): R
      toBeInvalid(): R
      toBeRequired(): R
      toBeValid(): R
      toHaveValue(value: string | string[]): R
    }
  }
}
