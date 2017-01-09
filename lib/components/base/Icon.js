'use babel'
import React from 'react'


const defaults = {
  iconset: 'ion',
  icon: 'ios-close-outline',
}


const Icon = (props) => {

  let { iconset, icon, onClick } = props || defaults
  let className = [
    'icon',
    iconset,
    iconset + '-' + icon,
    icon ].join(' ')

  return (
    <article
      className={className}
      onClick={e => onClick ? onClick(e, {iconset, icon}) : null}
    />
 )
}

export default Icon
