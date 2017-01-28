'use babel'

import React from 'react'
import { render } from 'react-dom'
import { flatten } from '../../utils'
import TabbedView from '../../components/TabbedView'


export const addTabView = (content) => {
  let el = document.createElement('section')
  el.setAttribute('class', 'package-config-view')
  // let conf = flatten(atom.config.getSchema(`reduced-dark-ui.${key}`).properties)

  let component = render((

    <TabbedView>
      <div title='welcome' icon='arrow-right'>moikkamoi!</div>
      <div title='layout' icon='ios-browsers'>{generateSettingsContent('layout')}</div>
      <div title='color' icon='ios-color-filter-outline'>{generateSettingsContent('palette')}</div>
      <div title='icons' icon='ios-pricetag'>{generateSettingsContent('icons')}</div>
      <div title='environment' icon='ios-settings'>{generateSettingsContent('env')}</div>
    </TabbedView>

  ), el)
  console.log(component, el)
  return el
}


const generateSettingsContent = (key) => {
  let conf = atom.config.getSchema(`reduced-dark-ui.${key}`)
  return conf.type + ": " + conf.title
}
