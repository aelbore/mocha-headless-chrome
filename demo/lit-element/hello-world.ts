import { LitElement, html, css } from 'lit-element'

class HelloWorldLit extends LitElement {

  message = ''
  
  static get properties() {
    return {
      message: { type: String }
    }
  }

  static get styles() {
    return css `
      h1 {
        color: var(--h1-color, red);
      }
    `
  }

  render() {
    return html `<h1>Hello ${this.message}</h1>`
  }

}

customElements.define('hello-world-lit', HelloWorldLit)