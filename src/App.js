import ClockComponent from './ClockComponent.js'
import clockData from './testData/clockData.js'

class App {
  constructor (props) {
    this.domComponent = props.domComponent
    this.render()
  }

  render = () => {
    // clock component
    clockData.forEach(clock => {
      // create element
      const clockComponentDomElement = document.createElement('div')
      clockComponentDomElement.id = `clock-component-${clock.id}`
      // append
      this.domComponent.appendChild(clockComponentDomElement)
      // instantiate javascript
      new ClockComponent({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.currentTimeInMilliseconds,
      })
    })
  }
}

new App({ domComponent: document.getElementById('app') })
