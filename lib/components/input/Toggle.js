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
    // let checked = value === true ? { checked: 'checked' } : {}

    return (
      <div>
      <input
        type="checkbox"
        defaultChecked={value === true}
        onChange={() => this.update(value == "true" ? "false" : "true")}
        ref={ref => this.reference = this.reference | ref}
      />
    </div>
    )
  }
}
