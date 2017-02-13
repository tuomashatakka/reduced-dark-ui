'use babel'
import React, { Component, prop as PropTypes } from 'react'
import { Icon } from '../base'
import { Emitter } from 'atom'

/**
 * @class Input
 * @extends React.Component
 */
export default class Input extends Component {

  reference = null

  constructor (props) {
    super(props)
    this.state = {
      value: this.props.value || ''
    }
    this.events = new Emitter()
    this.reference = null
    this.setValue = this.setValue.bind(this)
    this.getValue = this.getValue.bind(this)
    this.update = this.update.bind(this)
    this.field = this.field.bind(this)
  }

  setValue (val) {
    let value = val || this.getValue()
    this.setState({ value })
    let { onChange } = this.props
    if (onChange)
      onChange(value)
  }

  getValue () {
    return this.reference.value
  }

  update (val) {
    this.setValue(val)
  }

  field (updateFunc) {
    return <input onChange={updateFunc} />
  }

  render () {

    let field
    let { children, type  } = this.props

    if (this.field)
      field = this.field(this.update)
    else
      field = children

    this.elem = field

    return (
      <div
        className={`controls ${type}-container`}>
        {field}
      </div>
    )
  }
}
