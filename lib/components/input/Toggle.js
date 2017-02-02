'use babel'
import React from 'react'
import Input from './Input'


/**
 * @class Toggle
 * @extends Input
 */
export default class Toggle extends Input {

  field () {
    let { value } = this.state
    let on = value.toString() == "true"
    // let checked = value === true ? { checked: 'checked' } : {}

    return (
      <input
        className="input-checkbox"
        type="checkbox"
        defaultChecked={on}
        onChange={() => this.update(on ? "false" : "true")}
        ref={ref => this.reference = this.reference | ref}
      />
    )
  }
}
