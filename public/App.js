import ClockComponent from './ClockComponent.js'
import createElement from './lib/createElement.js'

// import clockData from './testData/clockData.js'

class App {
  constructor (props) {
    // Enable navigation prompt
    window.onbeforeunload = function () {
      return true
    }
    this.domComponent = props.domComponent
    this.domComponent.className = 'app'
    this.render()
  }

  getClocks = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/get_clocks`)
      const data = await res.json()
      if (res.status === 200) {
        return data
      } else throw new Error()
    } catch (err) {
      console.log(err)
    }
  }

  newClock = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/add_clock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Clock',
          current_time_in_milliseconds: 0
        })
      })
      const data = await res.json()
      console.log(data)
      if (res.status === 201) {
        this.render()
      } else throw new Error()
    } catch (err) {
      window.alert('Failed to create new clock...')
      console.log(err)
    }
  }

  render = async () => {
    // clear
    this.domComponent.innerHTML = ''

    // add clock button
    const clockButton = createElement('button', {}, '+ Clock')
    clockButton.addEventListener('click', this.newClock)
    this.domComponent.appendChild(clockButton)
    // clock component
    const clockData = await this.getClocks()
    clockData.forEach(clock => {
      // create element
      const clockComponentDomElement = createElement('div', {
        div: `clock-component-${clock.id}`
      })
      // append
      this.domComponent.appendChild(clockComponentDomElement)
      // instantiate javascript
      new ClockComponent({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.current_time_in_milliseconds,
        parentRender: this.render
      })
    })
    const clockSaveMessageDiv = createElement('small', {}, '* Clocks are auto saved every 60 seconds while running, or when stop is pressed')
    this.domComponent.appendChild(clockSaveMessageDiv)
  }
}

new App({ domComponent: document.getElementById('app') })
