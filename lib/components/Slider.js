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
    this.setValue = this.setValue.bind(this)
    this.setPosition = this.setPosition.bind(this)
    // atom.config.onDidChange(
    //   'reduced-dark-ui.layout.uiScale',
    //   val => this.setPosition(val, {scaled: false}))

  }

  render () {

    let { dragged, value, x } = this.state
    let { context, handler } = this.props
    let { left } = this.getBounds()
    let translation = { transform: 'translate(' + (x - left) + 'px, -50%)' }

    const onStart = (e) => {
      if (this.state.dragged)
        return

      let x = e.clientX
      let dragged = true

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

    const onDrag = (e) => {
      let { dragged } = this.state
      if (!dragged)
        return

      let x = e.clientX
      this.setPosition(x)

      handler(this.getValue())
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
    let { container } = this.props
    let { minimum, maximum } = schema
    let { width, left } = this.getBounds()

    if (x < left)           x = left
    if (x - left > width)   x = left + width
   console.log(x, left, top, minimum, maximum);
    x = parseInt( (x - minimum) / ( maximum - minimum ) * width )
    console.log(x);
    this.setState({ x })
  }

  getBounds () {
    let { width, left } = this.props.container.getBoundingClientRect()
    return { width, left }
  }

  getValue () {
    let { x } = this.state
    let { width, left } = this.getBounds()
    let value = parseInt((x - left) / width * 100)
    return value
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
