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
    let { enum: choices } = this.props

    return (
      <section
        ref={ref => this.reference = this.reference | ref}
        className="select enum btn-group">

        {choices.map((o, n) =>
          <Button key={n} value={o} onClick={this.update} selected={o == value}>
            {o}</Button>
        )}

      </section>
    )
  }
}
