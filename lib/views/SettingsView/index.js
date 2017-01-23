'use babel'



import React, { Component, prop as PropTypes } from 'react'
import { extendCallbackFor, observeSettingsPanel } from './register'

export {
  InputField,
  extendCallbackFor,
  observeSettingsPanel,
}

/**
 * @class
 * @extends React.Component
 */
export default class InputField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false
    }
  }

  render () {
    let { children } = this.props
    let { open } = this.state

    return (
      <section>
        {children}
      </section>
    )
  }
}
