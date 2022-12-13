import createElement from '../lib/createElement.js'
import state from '../lib/state.js'

export default class ClocksView {
  constructor(props) {
    this.domComponent = props.domComponent
    this.domComponent.className = 'standard-view'
    this.render()
  }

  render = async () => {
    this.domComponent.innerHTML = ''
  }
}