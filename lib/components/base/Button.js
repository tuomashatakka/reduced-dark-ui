'use babel'
import React from 'react'


const defaults = {
  type: 'default',
  children: [],
}


const Button = (props) => {

  let { children, onClick, type, selected, value } = props || defaults
  let className = [
    'btn',
    'btn-' + type,
    'state-' + type,
    type ].join(' ')

  if(selected)
    className += " selected"

  return (
    <a
      className={className}
      onClick={e => {
        let params = [e, e.target]

        if(!onClick) return
        if (value) params.unshift(value)
        onClick(...params)
      }}>
      {children}
    </a>
  )
}


export default Button
