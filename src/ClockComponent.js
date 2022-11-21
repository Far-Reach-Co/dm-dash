import createElement from './lib/createElement.js'

export default class ClockComponent {
  constructor (props) {
    this.domComponent = props.domComponent
    this.id = props.id
    this.title = props.title
    this.isRunning = false,
    this.currentTimeInMilliseconds = props.currentTimeInMilliseconds
    this.runClock = undefined
    this.edit = false
    this.runSpeed = 1
    this.render()
  }

  calculateNowAndRunspeed = () => {
    return Math.floor(Date.now() * this.runSpeed)
  }
  
  start = () => {
    if (!this.isRunning) {
      this.isRunning = true

      var startTime = this.calculateNowAndRunspeed() - this.currentTimeInMilliseconds
      this.runClock = setInterval(() => {
        var elapsedTime = this.calculateNowAndRunspeed() - startTime

        // reset if one day
        if(elapsedTime === 8640000) this.currentTimeInMilliseconds = 0

        var timeDif = elapsedTime - this.currentTimeInMilliseconds
        // console.log(timeDif)
        this.currentTimeInMilliseconds += timeDif
        this.renderDisplayTime()
      }, 100)
    }
  }

  stop = () => {
    clearInterval(this.runClock)
    this.isRunning = false
  }

  reset = () => {
    this.currentTimeInMilliseconds = 0
    this.renderDisplayTime()
  }

  toggleEdit = () => {
    this.stop()
    this.edit = !this.edit
    this.render()
  }

  renderDisplayTime = () => {
    const currentTimeDiv = document.getElementById(`current-time-${this.id}`)
    
    var milliseconds = this.currentTimeInMilliseconds
    var time = this.msToTime(milliseconds)

    if(this.edit) {
      const timeInput = document.getElementById(`time-input-${this.id}`)
      timeInput.value = time.substring(0, time.length - 2)
      return
    }

    currentTimeDiv.innerHTML = time
  }

  msToTime = (duration) => {
    let milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
      // days = Math.floor(duration / (1000 * 60 * 60 * 24))

    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    return (
      // 'Days: ' +
      // days +
      // '........' +
      hours +
      ':' +
      minutes +
      ':' +
      seconds +
      '.' +
      milliseconds
    )
  }

  render = () => {
    // clear
    this.domComponent.innerHTML = ''
    
    if(this.edit) {
      var milliseconds = this.currentTimeInMilliseconds
      var time = this.msToTime(milliseconds)
      var valueForInput = time.substring(0, time.length - 2)

      const timeInput = createElement('input', {'id': `time-input-${this.id}`, 'value': valueForInput, 'type': 'time'})
      timeInput.addEventListener('change', (e) => this.currentTimeInMilliseconds = e.target.valueAsNumber)
      const editButton = createElement('button', {}, 'Done')
      editButton.addEventListener('click', this.toggleEdit)

      this.domComponent.appendChild(timeInput)
      timeInput.focus()
      this.domComponent.appendChild(editButton)
      return
    }
    
    const titleDiv = createElement('div', {}, this.title)
    const currentTimeDiv = createElement('div', {id: `current-time-${this.id}`})

    const startButton = createElement('button', {}, 'Start')
    startButton.addEventListener('click', this.start)

    const stopButton = createElement('button', {}, 'Stop')
    stopButton.addEventListener('click', this.stop)

    const resetButton = createElement('button', {}, 'Reset')
    resetButton.addEventListener('click', this.reset)

    const editButton = createElement('button', {}, 'Edit')
    editButton.addEventListener('click', this.toggleEdit)

    const selectSpeed = createElement('select', {name: 'speed'}, [
      createElement('option', {value: 1}, '--Speed Select--'),
      createElement('option', {value: 1}, '1'),
      createElement('option', {value: 0.5}, '1/2'),
      createElement('option', {value: 0.25}, '1/4'),
      createElement('option', {value: 2}, '2x'),
      createElement('option', {value: 4}, '4x')
    ])
    selectSpeed.addEventListener('change', (e) => {
      this.stop()
      this.runSpeed = parseFloat(e.target.value)
      this.start()
    })

    // append    
    const fragment = document.createDocumentFragment() // try fragment method
    fragment.append(titleDiv, currentTimeDiv, startButton, stopButton, resetButton, editButton, selectSpeed)
    this.domComponent.appendChild(fragment)
    this.renderDisplayTime()
  }
}
