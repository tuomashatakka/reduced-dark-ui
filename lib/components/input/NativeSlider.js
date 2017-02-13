'use babel'
import React from 'react'
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
      <div style={{display: 'flex'}}>
        <span style={{flex: '0 1'}} className='bound min'>{minimum}</span>
      <input
        style={{flex: '1 1 100%'}}
        type="range"
        defaultValue={value}
        min={minimum}
        max={maximum}
        onChange={e => this.preview ? (this.preview.innerHTML = e.target.value) : null}
        onMouseUp={e => this.update(e.target.value)}
        ref={ref => this.reference = this.reference | ref}
      />
    <output style={{flex: '0 1'}} ref={ref => this.preview = ref}>{value}</output>
      <span style={{flex: '0 1'}} className='bound max'>{maximum}</span>

    </div>
    )
  }
}
