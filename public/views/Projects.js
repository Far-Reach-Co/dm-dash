import createElement from '../lib/createElement.js'
import state from '../lib/state.js'

class ProjectsView {
  constructor(props) {
    this.domComponent = props.domComponent
    this.render()
  }

  getProjects = async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/get_projects/${state.user.id}`)
      const data = await res.json()
      if (res.status === 200) {
        return data
      } else throw new Error()
    } catch (err) {
      console.log(err)
    }
  }

  newProject = async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/add_project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          title: 'New Project'
        })
      })
      const data = await res.json()
      console.log(data)
      if (res.status === 201) {
        this.render()
      } else throw new Error()
    } catch (err) {
      window.alert('Failed to create new project...')
      console.log(err)
    }
  }

  render = async () => {
    // add project button
    const projectButton = createElement('button', {}, '+ Project')
    projectButton.addEventListener('click', this.newProject)
    this.domComponent.appendChild(projectButton)
    const title = createElement('h1', {}, 'List of projects:')
    this.domComponent.appendChild(title)
    const projectData = await this.getProjects()
    projectData.forEach(project => {
      // create element
      const projectDomElement = createElement(
        'div',
        {
          id: `project-${project.id}`,
          class: 'project-button'
        },
        project.title
      )
      projectDomElement.addEventListener('click', e => {
        e.preventDefault()
        const searchParams = new URLSearchParams(window.location.search)
        searchParams.set('view', 'clocks')
        window.location.search = searchParams.toString()
      })
      // append
      this.domComponent.appendChild(projectDomElement)
    })
  }
}

export default ProjectsView