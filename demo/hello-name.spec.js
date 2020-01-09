class HelloName extends HTMLElement {

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

customElements.define('hello-name', HelloName)

describe('HelloName', () => {

  before(() => {
    const element = document.createElement('hello-name')
    document.body.appendChild(element)
  })

  it('shoudl work (hello-name)', () => {
    const element = document.body.querySelector('hello-name')
    
    assert.ok(element)
    assert.ok(element.shadowRoot)
    assert.ok(element.shadowRoot.querySelector('h1'))
  })

})