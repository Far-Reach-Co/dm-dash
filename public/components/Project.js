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

  toggleEdit = () => {
    this.edit = !this.edit
    this.render()
  }

  renderEditProject = () => {
    const titleInput = createElement('input', {
      value: this.title
    })
    const editButton = createElement('button', {}, 'Done')
    editButton.addEventListener('click', async () => {
      this.editTitle()
      await this.saveClock()
      this.toggleEdit()
      this.parentRender()
    })
    const removeButton = createElement('button', {class: 'btn-red'}, 'Delete Project')
    removeButton.addEventListener('click', async () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        await this.removeClock()
        this.toggleEdit()
        this.parentRender()
      }
    })
    this.domComponent.appendChild(createElement('div', {style: 'margin-right: 10px;'}, 'Edit'))
    this.domComponent.appendChild(titleInput)
    this.domComponent.appendChild(editButton)
    this.domComponent.appendChild(removeButton)
  }

  render = () => {
    this.domComponent.innerHTML = ''

    if (this.edit) {
      this.renderEditProject()
      return
    }

    const projectButton = createElement(
      'div',
      {
        id: `project-${this.id}`,
        class: 'project-button'
      },
      [
        this.title,
        createElement(
          'div',
          { class: 'project-date' },
          `Created: ${new Date(this.dateCreated).toLocaleDateString('en-gb', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`
        )
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
    editIcon.addEventListener('click', this.toggleEdit)

    this.domComponent.appendChild(projectButton)
    this.domComponent.appendChild(editIcon)
  }
}
