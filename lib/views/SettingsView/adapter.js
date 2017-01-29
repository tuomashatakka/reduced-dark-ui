'use babel'

import React from 'react'
import { render } from 'react-dom'
import { flatten } from '../../utils'
import TabbedView from '../../components/TabbedView'
import EditorMini from '../../components/input/EditorMini'


const getFieldsFor = (key) => {
  let schema = atom.config.getSchema('reduced-dark-ui')
  let conf = flatten(schema.properties)
  let fields = []

  for (let name in conf) {
    let opt = conf[name]
    let match = opt.path.filter(o => o == key).length == 1
    let { path, branch } = opt

    path = path.join('.')
    opt.scope = `reduced-dark-ui.${path}.${name}`
    opt.name = name

    if (match && branch)
      fields.push(opt)
  }
  return fields
}


export const addTabView = (content) => {

  let el = document.createElement('section')
  let readme = { __html: content.initial }
  let component = render((

    <TabbedView>
      <div title='readme' icon='ios-home' dangerouslySetInnerHTML={readme}></div>
      <div title='layout' icon='ios-browsers'>{generateSettingsContent('layout')}</div>
      <div title='color' icon='ios-color-filter-outline'>{generateSettingsContent('palette')}</div>
      <div title='icons' icon='ios-pricetag'>{generateSettingsContent('icons')}</div>
      <div title='environment' icon='ios-settings'>{generateSettingsContent('env')}</div>
    </TabbedView>

  ), el)
  el.setAttribute('class', 'package-config-view')

  return el
}


const generateSettingsContent = (key) => {
  let conf = atom.config.getSchema(`reduced-dark-ui.${key}`)
  let fields = getFieldsFor(key)
  let { type, title, description } = conf

  return (
    <div>
      <h3>{title}</h3>
      <div className='description'>
        {description}
      </div>

      {fields.map((field, n) => {

        let { name, description, title, type, path, scope } = field
        field = {
          ...field,
          onChange: val => atom.config.set(scope, val),
          icon: "ios-browsers",
        }

        switch (type) {

          case "color":
            return <EditorMini {...field} />
          default:
            return <EditorMini {...field} />
        }})}
    </div>
  )
}
