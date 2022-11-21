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
    this.render()
  }
  
  start = () => {
    if (!this.isRunning) {
      this.isRunning = true
      var startTime = Date.now() - this.currentTimeInMilliseconds
      this.runClock = setInterval(() => {
        var elapsedTime = Date.now() - startTime
        this.currentTimeInMilliseconds = elapsedTime
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

  renderDisplayTime = () => {
    const currentTimeDiv = document.getElementById(`current-time-${this.id}`)
    const timeInput = document.getElementById(`time-input-${this.id}`)
    var milliseconds = this.currentTimeInMilliseconds
    var time = this.msToTime(milliseconds)
    if(this.edit) {
      timeInput.value = time.substring(0, time.length - 2)
      return
    }
    currentTimeDiv.innerHTML = time
  }

  msToTime = (duration) => {
    let milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
      days = Math.floor(duration / (1000 * 60 * 60 * 24))

    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    return (
      // 'Days: ' +
      // days +
      // '' +
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
    if(this.edit) {
      const timeInput = createElement('input', {'id': `time-input-${this.id}`, 'value': '13:30', 'type': 'time'})
      this.domComponent.appendChild(timeInput)
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
    // append    
    const fragment = document.createDocumentFragment() // try fragment method
    fragment.append(titleDiv, currentTimeDiv, startButton, stopButton, resetButton)
    this.domComponent.appendChild(fragment)
    this.renderDisplayTime()
  }
}
