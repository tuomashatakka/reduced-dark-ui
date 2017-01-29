'use babel'
import React, { Component, prop as PropTypes } from 'react'
import Input from './Input'


/**
 * @class EditorMini
 * @extends Input
 */
export default class EditorMini extends Input {

  getValue () {
    let model = this.reference.getModel()
    return model.getText()
  }

  field () {
    return (<atom-text-editor mini
      ref={ref => {
        if (this.reference || !ref) return
          ref.getModel().onDidStopChanging(this.update)
        return this.reference = ref}}
    />)
  }
}
