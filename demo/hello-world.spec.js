const assert = this.chai.assert

class HelloWorld extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes() {
    return [ 'message' ]
  }

  connectedCallback() {
    for (const prop of (this.constructor).observedAttributes) {
      if (this.hasAttribute(prop)) {
        this[prop] = this.getAttribute(prop)
      }
    }
    this.render()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render()
    }
  }

  get message() {
    return this.getAttribute('message')
  }

  set message(value) {
    this.setAttribute('message', value)
  }

  render() {
    this.shadowRoot.innerHTML = `
      <h1>Hello ${this.message}</h1>
    `
  }

}

customElements.define('hello-world', HelloWorld)

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