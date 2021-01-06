import * as va from '../src/index'

test('URL Parameter Parsing', () => {

  global.window = Object.create(window)
  Object.defineProperty(window, 'location', {
    value: {
      search: 'https://www.web.com/page?param1=value1&param2&param3=value3',
    },
    writable: true,
  })

  const params = va.getUrlParams()

  expect(params['param1']).toBeDefined()
  expect(params['param1']).toBe('value1')
  expect(params['param2']).toBeDefined()
  expect(params['param3']).toBeDefined()
  expect(params['param3']).toBe('value3')

  expect(va.getUrlParam('param1')).toBe('value1')
  expect(va.getUrlParam('param2')).toBe('')
  expect(va.getUrlParam('param3')).toBe('value3')
})
