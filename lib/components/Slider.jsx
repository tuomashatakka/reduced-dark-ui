'use babel'
import { Component } from 'react'


export default class Slider extends Component {


  constructor () {
    super()
    this.state = {
      dragged: false,
      x: 0,
      width: 1,
    }
  }


  render () {

    let backgroundStyle = {
      position: 'relative',
      width: '100%',
      height: '4px',
      borderRadius: '4px',
      background: 'red',
    }

    let knobStyle = {
      position: 'absolute',
      left: this.state.x - this.state.left,
      top: '-4px',
      height: '16px',
      width: '16px',
      background: 'yellow',
      borderRadius: '50%',
    }

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
        style={backgroundStyle}>
        <div style={knobStyle}></div>
      </div>
    )
  }

}
