'use babel'

import React, { Component } from 'react'
import { render } from 'react-dom'

const setFieldValue = (field, value) => {
  // Subscribes to the onDidStopChanging event of the
  // ´field´ text editor instance. ´search´ is the handler
  // for the change event.
  if (!field)
    return

  let model = field.getModel ? field.getModel() : field
  let schema = atom.config.getSchema('reduced-dark-ui.layout.uiScale')
  let { minimum, maximum } = schema
  let len = (maximum-minimum)
  let val = parseInt( minimum + (value / 100 * len) )
  value = val > maximum ? maximum : val < minimum ? minimum : val
  console.log(val)

  if (model && model.setText)
    model.setText(value.toString())
  else
    model.value = value.toString()

  return value.toString()
}


export class Slider extends Component {

  constructor (props) {
    super(props)
    this.state = {
      value: props.initialValue || 0,
      dragged: false,
      x: 0,
      co: {},
    }
    this.setValue = this.setValue.bind(this)
    this.setPosition = this.setPosition.bind(this)
    // atom.config.onDidChange(
    //  'reduced-dark-ui.layout.uiScale',
    //  this.setPosition)

  }

  render () {

    let { dragged, value, x, co } = this.state
    let { context, handler, width } = this.props
    let translation = { transform: 'translate(' + (x - co.left) + 'px, -50%)' }

    const onStart = (e) => {
      if (this.state.dragged)
        return

      let x = e.clientX
      let co = e.target.parentElement.getBoundingClientRect()
      let dragged = true

      this.setState({ dragged, co, x })
      context.addEventListener('mousemove', onDrag)
      context.addEventListener('mouseup', onEnd)
    }

    const onEnd = (e) => {

      let { x, co } = this.state
      let value = parseInt((x - co.left) / co.width * 100)
      let dragged = false

      this.setState({ dragged, value })
      context.removeEventListener('mousemove', onDrag)
      context.removeEventListener('mouseup', onEnd)
      handler(this.state.value)
    }

    const onDrag = (e) => {
      let { co, dragged } = this.state
      if (!dragged)
        return

      let x = e.clientX
      if (x < co.left)
        x = co.left
      if (x - co.left > co.width)
        x = co.left + co.width

      this.setState({ x })
      let value = parseInt((x - co.left) / co.width * 100)
      handler(value)
    }

    return (
      <div
        className="input-range-container"
        onMouseDown={onStart}>

        <span
          className='input-range-knob'
          style={translation} />
      </div>
    )
  }

  setPosition (x) {
    let schema = atom.config.getSchema('reduced-dark-ui.layout.uiScale')
    let { minimum, maximum } = schema
    let { co } = this.state
    let { width } = co || this.props

    x = parseInt( (x - minimum) / ( maximum - minimum ) * width )
    this.setState({ x })
  }

  setValue (value) {
    this.setState({ value })
  }
}


export class SliderAdapter {

  constructor (options) {

    let { element, context } = options
    this.item = element

    let widget = this.widget = document.createElement('div')
    let initialValue = this.getValue()
    let width = widget.getBoundingClientRect().width
    let refer = ref => ref ? this.component = ref : null
    let onDragFinished = (value) => setFieldValue(element, value)

    widget.setAttribute('class', 'input-range')
    widget.setAttribute('type', 'range')
    element.insertAdjacentElement('afterEnd', widget)
    element.widget = widget
    element.slider = this

    render(
      <Slider
        ref={refer}
        context={context}
        handler={onDragFinished}
        initialValue={initialValue}
        width={width}
      />,
      widget)
  }

  dispose () {
    this.item.remove()
  }

  getValue () {
    return this.item ? this.item.getModel().getText() : 0
  }
}


export default function createSlider (options) {

  let { slider } = options.element
  console.log(slider)

  slider = slider || new SliderAdapter(options)


  return slider
}
