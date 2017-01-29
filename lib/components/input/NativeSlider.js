'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Input from './Input'


/**
 * @class Slider
 * @extends Input
 */
export default class Slider extends Input {

  field () {
    let { value } = this.state
    let { minimum, maximum } = this.props

    return (
      <input
        type="range"
        defaultValue={value}
        min={minimum}
        max={maximum}
        onChange={e => this.update(e.target.value)}
        ref={ref => this.reference = this.reference | ref}
      />
    )
  }
}
