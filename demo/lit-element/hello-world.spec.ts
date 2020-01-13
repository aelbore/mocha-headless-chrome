import { expect } from 'chai'

import './hello-world'

describe('HelloWorld LitElement', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('hello-world')
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  it('should have element', () => {
    expect(element).to.be.not.undefined
  })

  it('should have shadowRoot.', () => {
    expect(element.shadowRoot).to.be.not.undefined
  })

  it('should have styles static get accessor', () => {
    const style = element.shadowRoot.querySelector('style');
    
    expect(style).to.be.not.undefined
  })

})