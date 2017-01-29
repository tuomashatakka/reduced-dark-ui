'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Input from './Input'


/**
 * @class EditorMini
 * @extends Input
 */
export default class EditorMini extends Input {

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
