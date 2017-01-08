'use babel'
import React from 'react'


const defaults = {
  iconset: 'ion',
  icon: 'ios-close-outline',
}


const Icon = (props) => {

  let { iconset, icon } = props || defaults
  let className = [
    'icon',
    iconset,
    iconset + '-' + icon,
    icon ].join(' ')

  return (
    <article
      className={className}
    />
 )
}

export default Icon
