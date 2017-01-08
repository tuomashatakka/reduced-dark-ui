'use babel'
import React from 'react'


const defaults = {
  type: 'default',
  children: [],
}


const Button = (props) => {

  let { children, onClick, type } = props || defaults
  let className = [
    'btn',
    'btn-' + type,
    'state-' + type,
    type ].join(' ')

  return (
    <a
      className={className}
      onClick={e => onClick ? onClick(e) : false}>
      {children}
    </a>
  )
}


export default Button
