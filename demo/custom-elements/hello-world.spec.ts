import { assert } from 'chai'

import './hello-world'

describe('HelloWorld', () => {

  before(() => {
    const element = document.createElement('hello-world')
    document.body.appendChild(element)
  })

  it('shoudl work', () => {
    const element = document.body.querySelector('hello-world')
    
    assert.ok(element)
    assert.ok(element.shadowRoot)
    assert.ok(element.shadowRoot.querySelector('h1'))
  })

})