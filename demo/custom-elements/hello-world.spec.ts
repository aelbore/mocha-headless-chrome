import { assert } from 'chai'

import './hello-world'

describe('HelloWorld', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('hello-world')
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  it('should work', () => {    
    assert.ok(element)
    assert.ok(element.shadowRoot)
    assert.ok(element.shadowRoot.querySelector('h1'))
  })

})