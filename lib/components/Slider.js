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
    }
    this.getValue = this.getValue.bind(this)
    this.setPosition = this.setPosition.bind(this)
    this.getPosition = this.getPosition.bind(this)
    // atom.config.onDidChange(
    //   'reduced-dark-ui.layout.uiScale',
    //   val => this.setPosition(val, {scaled: false}))

  }

  render () {

    let { dragged } = this.state
    let { context, handler } = this.props
    // let translation = { transform: 'translate(' + (x - left) + 'px, -50%)' }
    translation = {
      left: this.getPosition() + '%' }

    const onStart = ({clientX: x}) => {

      let { dragged } = this.state
      if (dragged)
        return

      dragged = true
      this.setPosition(x)
      this.setState({ dragged })

      context.addEventListener('mousemove', onDrag)
      context.addEventListener('mouseup', onEnd)
    }

    const onEnd = (e) => {

      let dragged = false
      this.setState({ dragged })

      context.removeEventListener('mousemove', onDrag)
      context.removeEventListener('mouseup', onEnd)

      handler(this.getValue())
    }

    const onDrag = ({clientX: x}) => {

      let { dragged } = this.state
      if (!dragged)
        return

      this.setPosition(x)
      handler(this.getPosition())
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
    let { width, left } = this.getBounds()
    let { minimum, maximum } = schema

    x -= left
    if (x < 0)      x = 0
    if (x > width)  x = width
    this.setState({ x })
    return x
  }

  getPosition (scaled=true) {
    let { width } = this.getBounds()
    let { x } = this.state
    console.log(x, x / width, x / width * 100)
    return scaled ? parseInt( x / width * 100) : x
  }

  getBounds () {
    let { container } = this.props
    return container.getBoundingClientRect()
  }

  getValue (scaled) {

    let schema = atom.config.getSchema('reduced-dark-ui.layout.uiScale')
    let pos = this.getPosition()
    let { minimum, maximum } = schema
    let range = maximum - minimum
    let scale = 100 / range
    let start = scale * minimum
    let value = min +  pos * scale
    return value
  }
}


export class SliderAdapter {

  constructor (options) {

    let { element, context } = options
    this.item = element

    let widget = this.widget = document.createElement('div')
    let initialValue = this.getValue()
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
        container={widget}
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
  slider = slider || new SliderAdapter(options)


  return slider
}
