'use babel'
import React, { Component, PropTypes as prop } from 'react'
import { Slider, Toggle, EnumToggle, EditorField, ColorPicker } from '../input'

const PACKAGE_NAME = 'reduced-dark-ui'

/**
 * @class Field
 * @extends React.Component
 */

export default class Field extends Component {

  constructor (props) {
    super(props)
    let scope = `${PACKAGE_NAME}.${props.scope}`
    this.getInput = this.getInput.bind(this)
    this.change = this.change.bind(this)
    this.reset = this.change.bind(this, null)
    this.schema = atom.config.getSchema(scope)

    this.state = {
      disabled: false,
      value: atom.config.get(scope) || "" }
  }

  change (arg) {

    let { scope } = this.props
    let { default: initial } = this.schema
    let value = !arg ?
      initial :
      arg.target ?
      arg.target.value :
      arg

    atom.config.set(`${PACKAGE_NAME}.${scope}`, value)
    this.setState({ value })
  }

  render () {

    let { title, description } = this.schema
    let { style, scope } = this.props

    scope = `${PACKAGE_NAME}.${scope}`.split('.').join('-')

    return (
      <label
        onDoubleClick={this.reset}
        className={`control-group ${scope} field-${style || 'regular'}`}>

        <header className='control-label'>
          <h4>{title}</h4>
          <p>{description}</p>
        </header>

        {this.getInput()}

      </label>
    )
  }

  getInput() {

    let { type, enum: choices } = this.schema
    let { value } = this.state

    let
      Component = EditorField

    if (type === 'integer')
      Component = Slider

    else if (type === 'boolean' )
      Component = Toggle

    else if (type === 'color' )
      Component = ColorPicker

    else if (type === 'string' && choices )
      Component = EnumToggle

    let fld = <Component
          {...this.schema}
          value={value}
          choices={choices}
          onChange={this.change} />

    console.log("fld", fld)
    return fld

  }
}

Field.propTypes = {
  scope: prop.string,
  style: prop.string,
}
