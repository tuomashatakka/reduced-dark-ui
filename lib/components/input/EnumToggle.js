'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Input from './Input'
import { Button } from '../base'


/**
 * @class EnumToggle
 * @extends Input
 */
export default class EnumToggle extends Input {

  field () {
    let { value } = this.state
    let { enum: choices, onChange } = this.props

    // DEBUG
    console.info("enum", choices)
    console.info("enum-props", this.props)

    return (
      <section
        ref={ref => this.reference = this.reference | ref}
        className="select enum btn-group">
        {choices.map((o, n) => {
          let selected = (o == value)
          return (

            <Button
              value={o}
              key={n}
              onClick={this.update}
              selected={selected}>
              {o}
            </Button>

          )
        })}
      </section>
    )
  }
}
