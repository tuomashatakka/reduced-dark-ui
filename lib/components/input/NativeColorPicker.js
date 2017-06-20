'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Input from './Input'


/**
 * @class ColorPicker
 * @extends Input
 */
export default class ColorPicker extends Input {

  field () {
    let { value } = this.state

    return (
      <input
        type="color"
        defaultValue={value}
        onChange={e => this.update(e.target.value)}
        ref={ref => this.reference = this.reference | ref}
      />
    )
  }
}
