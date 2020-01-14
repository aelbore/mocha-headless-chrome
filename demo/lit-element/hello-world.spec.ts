import { assert } from 'chai'

import './hello-world'

describe('HelloWorld LitElement', () => {
  let element: HTMLElement

  async function createElement(element: string) {
    const el = document.createElement(element)
    document.body.appendChild(el)

    /// @ts-ignore
    await el.updateComplete

    return el;
  }

  beforeEach(async() => {
    element = await createElement('hello-world-lit')
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  it('should have element', async () => {
    assert.ok(element)
    assert.ok(element.shadowRoot)
    assert.ok(element.shadowRoot.querySelector('h1'))
  })

})