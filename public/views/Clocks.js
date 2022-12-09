import Clock from '../components/Clock.js'
import createElement from '../lib/createElement.js'
import state from '../lib/state.js'

export default class ClocksView {
  constructor(props) {
    this.domComponent = props.domComponent
    this.domComponent.className = 'clocks-view'
    this.render()
  }

  getClocks = async () => {
    const searchParams = new URLSearchParams(window.location.search)
    var projectId = searchParams.get('project')
    try {
      const res = await fetch(`${window.location.origin}/api/get_clocks/${projectId}`)
      const data = await res.json()
      if (res.status === 200) {
        state.clocks = data
        return data
      } else throw new Error()
    } catch (err) {
      console.log(err)
    }
  }

  newClock = async () => {
    if(!state.clocks) return

    const searchParams = new URLSearchParams(window.location.search)
    var projectId = parseInt(searchParams.get('project'))
    try {
      const res = await fetch(`${window.location.origin}/api/add_clock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Clock',
          current_time_in_milliseconds: 0,
          project_id: projectId
        })
      })
      const data = await res.json()
      if (res.status === 201) {
        this.render()
      } else throw new Error()
    } catch (err) {
      window.alert('Failed to create new clock...')
      console.log(err)
    }
  }

  render = async () => {
    this.domComponent.innerHTML = ''
    // new clock button
    const newClockButton = createElement('button', {style: 'align-self: flex-end;'}, '+ Clock')
    newClockButton.addEventListener('click', this.newClock)
    this.domComponent.appendChild(newClockButton)

    const clockSaveMessageDiv = createElement(
      'small',
      {style: 'align-self: flex-end;'},
      '* Clocks are auto saved every 60 seconds while running, or when stop is pressed'
    )
    this.domComponent.appendChild(clockSaveMessageDiv)
    // clock component
    const clockData = await this.getClocks()
    clockData.forEach(clock => {
      // create element
      const clockComponentDomElement = createElement('div', {
        id: `clock-component-${clock.id}`
      })
      // append
      this.domComponent.appendChild(clockComponentDomElement)
      // instantiate javascript
      new Clock({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.current_time_in_milliseconds,
        parentRender: this.render
      })
    })
  }
}