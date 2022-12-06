import createElement from './lib/createElement.js'
import state from './lib/state.js'
import ProjectsView from './views/Projects.js'
import ClocksView from './views/Clocks.js'

class App {
  constructor (props) {
    this.domComponent = props.domComponent
    this.domComponent.className = 'app'
    this.init()
  }

  init = async () => {
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
          document
            .getElementById('footer')
            .appendChild(
              createElement('div', { style: 'font-size: 18px' }, resData.email)
            )
        } else if (res.status === 400) {
          window.location.pathname = '/login.html'
        } else throw resData.error
      } catch (err) {
        console.log(err)
        window.location.pathname = '/login.html'
      }
    } else window.location.pathname = '/login.html'
  }

  renderClocksView = async () => {
    const element = createElement('div')
    new ClocksView({ domComponent: element })
    this.domComponent.appendChild(element)
  }

  renderProjectsView = () => {
    const element = createElement('div')
    new ProjectsView({ domComponent: element })
    this.domComponent.appendChild(element)
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
