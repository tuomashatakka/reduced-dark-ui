'use babel'

import React from 'react'
import { render } from 'react-dom'
import { flatten } from '../../utils'
import chooseIcon from '../../components/IconPicker'
import input from '../../components/input'
import TabbedView from '../../components/TabbedView'
import Slider from '../../components/input/NativeSlider'
import EditorMini from '../../components/input/EditorMini'
import ColorPicker from '../../components/input/NativeColorPicker'
import EnumToggle from '../../components/input/EnumToggle'
import Toggle from '../../components/input/Toggle'
import { Icon, Button } from '../../components/base'


const getFieldsFor = (key) => {
  let schema = atom.config.getSchema('reduced-dark-ui')
  let conf = flatten(schema.properties)
  let fields = []

  for (let name in conf) {
    let opt = conf[name]
    let match = opt.path.filter(o => o == key).length == 1
    let { path, branch } = opt

    if (match && branch) {
      path = path.join('.')
      opt.scope = `reduced-dark-ui.${path}.${name}`
      opt.name = name
      opt.value = atom.config.get(opt.scope)
      fields.push(opt)
    }
  }
  return fields
}


export const addTabView = (content) => {

  console.log(input);

  let el = document.createElement('section')
  let readme = { __html: content.initial }
  let component = render((

    <TabbedView>

      <div
        title='readme'
        icon='ios-home'
        dangerouslySetInnerHTML={readme}
        />

      <div title='layout' icon='ios-browsers'>
        {generateSettingsContent('layout')}
      </div>

      <div title='color' icon='ios-color-filter-outline'>
        {generateSettingsContent('palette')}
      </div>

      <div title='miscellaneous' icon='ios-color-filter-outline'>
        {generateSettingsContent('decor')}
      </div>

      <div title='icons' icon='ios-pricetag'>
        {generateIconSettingsContent()}
      </div>

      <div title='environment' icon='ios-settings'>
        {generateSettingsContent('env')}
      </div>

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

    <article className='sub-section'>

      <header className='controls sub-section-heading'>

        <h3>
          {title}</h3>

        <div className='description'>
          {description}</div>

      </header>

      <section className='controls sub-section-body'>

      {
        fields.map((field, n) => {

        let { name, description, title, type, path, scope } = field
        let onChange = val => atom.config.set(scope, val)
        let icon = 'ios-browsers'
        let key = name
        field = { ...field, onChange, icon, key }

        switch (type) {

          case "color":
            let fi =
              <ColorPicker
                {...field}
                value={field.value.toJSON()}
                />

            if (path.indexOf('state') !== -1)
                return <div className='color-cell color-minor'>{fi}</div>
              return <div className='color-cell color-display'>{fi}</div>

          case "string":
            if (field.enum)
              return <EnumToggle {...field} />

            return <EditorMini {...field} />

          case "integer":
            return <Slider {...field} />

          case "boolean":
            return <Toggle {...field} />

          default:
            return <EditorMini {...field} />

        }})
      }
      </section>
    </article>
  )
}


const generateIconSettingsContent = () => {
  let key = 'icons'
  let scope = `reduced-dark-ui.${key}`
  let fields = atom.config.get(scope)
  let {title, description} = atom.config.getSchema(scope)
  console.log(fields);
  return (

      <article className='sub-section'>

        <header className='controls sub-section-heading'>

          <h3>
            {title}</h3>

          <div className='description'>
            {description}</div>

        </header>

        <section className='controls sub-section-body'>
          {Object.keys(fields).map(name => {
            let field = fields[name]
            let onSuccess = (e, val) => {
              console.log(val);
              atom.config.set(scope, {...fields, [name]: val})
              field = val
            }
            return (
              <div className='control-group'>

                <Icon {...field} />
                {name}

                <Button onClick={()=>chooseIcon({ onSuccess })}>
                  Change
                </Button>
              </div>
            )
          })}
        </section>

      </article>
  )
}
window.generateIconSettingsContent = generateIconSettingsContent
