'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Input from './Input'


/**
 * @class ColorField
 * @extends Input
 */
export default class ColorField extends Input {

  reference = null

  field () {
    return (<atom-text-editor mini ref={ref => {
      if (!ref || this.reference) return
      this.reference = ref
      let model = ref.getModel()
      model.onDidStopChanging(
        () => this.onChange(
          model.getText()))
      return ref
    }} />)
  }
}
