'use babel'
import React from 'react'
import { render } from 'react-dom'

class Component extends React.Component{
  constructor () {
    super()
    this.state = {
      dragged: false,
      x: 0,
      width: 1,
    }
  }
  render () {
    let refer
    return (
      <div
        onMouseDown={e=>{
          console.log(e)
          let pos = e.target.getBoundingClientRect()
          this.setState({
            dragged: true,
            left: pos.left
          })
        }}
        onMouseMove={e=>{
          if (this.state.dragged) {
            this.setState({x: e.clientX})
            window.tttt = e.target
            let pos = e.target.getBoundingClientRect()
            console.log(e.clientX, e.target.offsetLeft, pos.left)
          }
        }}
        onMouseUp={e=>{
          console.log(e)
          this.setState({dragged: false})
        }}
        className="range-widget"
        style={{
          position: 'relative',
          width: '100%',
          height: '4px',
          borderRadius: '4px',
          background: 'red',
        }}>
        <div
          style={{
            position: 'absolute',
            left: this.state.x - this.state.left,
            top: '-4px',
            height: '16px',
            width: '16px',
            background: 'yellow',
            borderRadius: '50%',
          }}></div>
      </div>)
  }
}


function observeSettingsPanel () {
  return atom.workspace.onDidOpen(item => checkIfSettingsOpened(item))
}

function checkIfSettingsOpened ({item, uri}) {
  if (uri !== 'atom://config')
    return false
  let pack = item.panelsByName['reduced-dark-ui']
  if (pack) {
    let {sections} = pack
    let uiScaleEditor = sections.find('atom-text-editor[type="number"]')
    let pos = uiScaleEditor.position()
    let key = uiScaleEditor.attr('id')
    console.log(key);
    uiScaleEditor.after('<div class="range">')
    let dragged = false
    render(<Component />, uiScaleEditor.next().get(0))
  }
}

export {
  observeSettingsPanel
}
