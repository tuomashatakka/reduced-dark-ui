'use babel'
import React from 'react'


const defaults = {
  type: 'default',
  children: [],
}


const Button = (props) => {

  let { children, onClick, type, selected } = props || defaults
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
      onClick={e => onClick ? onClick(e) : false}>
      {children}
    </a>
  )
}


export default Button
