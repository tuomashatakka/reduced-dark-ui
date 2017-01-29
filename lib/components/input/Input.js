'use babel'
import React, { Component, prop as PropTypes } from 'react'
import { Icon } from '../base'

/**
 * @class Input
 * @extends React.Component
 */
export default class Input extends Component {

  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange (value) {

    this.setState({ value })
    let { onChange } = this.props
    if (onChange)
      onChange(value)
    return value
  }

  render () {

    let field
    let { children, title, description, icon } = this.props

    if (this.field)
      field = this.field()
    else
      field = children

    return (
      <label className="control-group">
        <header className="setting-title control-label">
          <Icon icon={icon} iconset='ion' />
          {title}
        </header>
        <aside className="setting-description">
          {description}
        </aside>
        <main className="controls">
          {field}
        </main>
      </label>
    )
  }
}
