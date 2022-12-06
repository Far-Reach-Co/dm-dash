import createElement from '../lib/createElement.js'

export default class Project {
  constructor (props) {
    this.domComponent = props.domComponent
    this.domComponent.className = 'project-btn-container'
    this.id = props.id
    this.title = props.title
    this.dateCreated = props.dateCreated
    this.edit = false

    this.render()
  }

  render = () => {
    this.domComponent.innerHTML = ''

    const projectButton = createElement(
      'div',
      {
        id: `project-${this.id}`,
        class: 'project-button'
      },
      [
        this.title,
        createElement('div', {class: 'project-date'}, `Created: ${new Date(this.dateCreated).toLocaleDateString(
          'en-gb',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }
        )}`)
      ]
    )
    projectButton.addEventListener('click', e => {
      e.preventDefault()
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('view', 'clocks')
      window.location.search = searchParams.toString()
    })

    const editIcon = createElement('img', {
      class: 'icon',
      src: '../assets/gears.svg'
    })
    editIcon.addEventListener('click', () => (this.edit = true))

    this.domComponent.appendChild(projectButton)
    this.domComponent.appendChild(editIcon)
  }
}
