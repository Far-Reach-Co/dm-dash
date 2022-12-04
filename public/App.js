import ClockComponent from './ClockComponent.js'
import createElement from './lib/createElement.js'
import state from './lib/state.js'
import ProjectsView from './views/Projects.js'

// import clockData from './testData/clockData.js'

class App {
  constructor (props) {
    this.domComponent = props.domComponent
    this.domComponent.className = 'app'
    this.init()
  }
  
  init = async () => {
    // Enable navigation prompt
    // window.onbeforeunload = function () {
    //   return true
    // }
    // for logout
    document.getElementById('logout-btn').addEventListener('click', e => {
      e.preventDefault()
      localStorage.removeItem('token')
      window.location.pathname = '/'
    })
    await this.verifyToken()
    this.render()
  }

  verifyToken = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await fetch(`${window.location.origin}/api/verify_jwt`, {
          headers: { 'x-access-token': `Bearer ${token}` }
        })
        const resData = await res.json()
        if (res.status === 200) {
          state.user = resData
        } else if (res.status === 400) {
          window.location.pathname = '/login.html'
        } else throw resData.error
      } catch (err) {
        console.log(err)
        window.location.pathname = '/login.html'
      }
    } else window.location.pathname = '/login.html'
  }

  getClocks = async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/get_clocks`)
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
      const res = await fetch(`${window.location.origin}/api/add_clock`, {
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

  renderClocksView = async () => {
    // add clock button
    const clockButton = createElement('button', {}, '+ Clock')
    clockButton.addEventListener('click', this.newClock)
    this.domComponent.appendChild(clockButton)
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
      new ClockComponent({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.current_time_in_milliseconds,
        parentRender: this.render
      })
    })
    const clockSaveMessageDiv = createElement(
      'small',
      {},
      '* Clocks are auto saved every 60 seconds while running, or when stop is pressed'
    )
    this.domComponent.appendChild(clockSaveMessageDiv)
  }

  renderProjectsView = () => {
    const projectsComponentDomElement = createElement('div')
    new ProjectsView({domComponent: projectsComponentDomElement})
    this.domComponent.appendChild(projectsComponentDomElement)
  }

  render = async () => {
    // clear
    this.domComponent.innerHTML = ''
    // routing
    const searchParams = new URLSearchParams(window.location.search)
    var view = searchParams.get('view')
    switch (view) {
      case 'projects':
        this.renderProjectsView()
      case 'clocks':
        return this.renderClocksView()
      default:
        return this.renderProjectsView()
    }
  }
}

new App({ domComponent: document.getElementById('app') })
