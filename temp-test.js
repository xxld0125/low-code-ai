import React from 'react'
import { render } from '@testing-library/react'
import { Checkbox } from './components/lowcode/basic/Checkbox/Checkbox'

test('debug checkbox aria-invalid', () => {
  const { container } = render(
    <Checkbox error="错误信息" data-testid="test-checkbox">
      测试
    </Checkbox>
  )

  const checkbox = container.querySelector('[data-testid=test-checkbox]')
  console.log('Checkbox element:', checkbox)
  console.log(
    'All attributes:',
    checkbox
      ? [...checkbox.attributes].map(attr => `${attr.name}="${attr.value}"`).join(', ')
      : 'not found'
  )

  // 检查实际的aria-invalid属性
  if (checkbox) {
    console.log('aria-invalid attribute:', checkbox.getAttribute('aria-invalid'))
    console.log('All props passed:', checkbox.outerHTML)
  }
})
