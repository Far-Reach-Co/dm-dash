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
      const timeInput = document.createElement('input')
      timeInput.id = `time-input-${this.id}`
      timeInput.type = 'time'
      timeInput.value = '13:30'
      this.domComponent.appendChild(timeInput)
      return
    }
    const titleDiv = document.createElement('div')
    titleDiv.innerText = this.title

    const currentTimeDiv = document.createElement('div')
    currentTimeDiv.id = `current-time-${this.id}`


    const startButton = document.createElement('button')
    startButton.addEventListener('click', this.start)
    startButton.innerText = 'Start'

    const stopButton = document.createElement('button')
    stopButton.addEventListener('click', this.stop)
    stopButton.innerText = 'Stop'

    const resetButton = document.createElement('button')
    resetButton.addEventListener('click', this.reset)
    resetButton.innerText = 'Reset'

    this.domComponent.appendChild(titleDiv)
    this.domComponent.appendChild(currentTimeDiv)
    this.renderDisplayTime()
    this.domComponent.appendChild(startButton)
    this.domComponent.appendChild(stopButton)
    this.domComponent.appendChild(resetButton)
  }
}
