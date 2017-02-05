'use babel'

import React from 'react'
import { Task } from 'atom'
import { render } from 'react-dom'
import { flatten } from '../../utils'
import chooseIcon from '../../components/IconPicker'
import { QueryField } from '../../components/QueryField'
import input from '../../components/input'
import TabbedView from '../../components/TabbedView'
import Slider from '../../components/input/NativeSlider'
import EditorMini from '../../components/input/EditorMini'
import ColorPicker from '../../components/input/NativeColorPicker'
import EnumToggle from '../../components/input/EnumToggle'
import Toggle from '../../components/input/Toggle'
import { Icon, Button } from '../../components/base'
import { applyFont } from '../../core/configuration'


const schema = atom.config.getSchema('reduced-dark-ui')
const conf = flatten(schema.properties)

const getFieldsFor = (key) => {
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


const ConfigInputField = ({type, scope}) => {
  let Field
  if (type === 'boolean')
    Field = Toggle
  else if (type === 'select')
    Field = EnumToggle
  else
    Field = EditorMini
  let icon = 'ios-pulse'
  let value = atom.config.get(`reduced-dark-ui.${scope}`)
  let onChange = val => atom.config.set(`reduced-dark-ui.${scope}`, val)
  let path = scope.split('.')
  let key = path.pop()
  let props = { ...conf[key], onChange, key, value, icon }

  return <Field {...props} />
}


export const addTabView = (content) => {

  let el = document.createElement('section')
  let readme = { __html: content.initial }
  let component = render((

    <TabbedView>

      <section
        title='readme'
        icon='ios-home'
        dangerouslySetInnerHTML={readme}
        />

      <section title='layout' icon='ios-browsers'>
        {generateSettingsContent('layout')}
      </section>

      <section title='color' icon='ios-color-filter-outline'>
        {generateSettingsContent('palette')}
      </section>

      <section title='miscellaneous' icon='ios-monitor-outline'>
        {generateFontSettingsContent()}
        <ConfigInputField type='boolean' scope='decor.overrideEditorBackground' />
        <ConfigInputField type='boolean' scope='decor.enhancedFx' />
      </section>

      <section title='icons' icon='ios-pricetag'>
        {generateIconSettingsContent()}
      </section>

      <section title='environment' icon='ios-settings'>
        {generateSettingsContent('env')}
      </section>

    </TabbedView>

  ), el)
  el.setAttribute('class', 'package-config-view')

  return el
}
export default addTabView


const inputField = (name, attrs={}) => {
  let field = getFieldsFor(name)
  let icon = attrs.icon || 'ios-browsers'
  field = generateInputField(name, {...field, icon})
  console.warn(field);
  return (
    <BaseSubSection>
      {field}
    </BaseSubSection>
  )

}

const generateInputField = (name, attrs) => {

  let {
    scope, title, description, path,
    type, value, icon } =
    attrs
  let onChange = val => atom.config.set(scope, val)
  let key = name
  let field = { ...attrs, onChange, key }

  switch (type) {

    case "color":
      field.value   = value.toJSON()
      let isState   = path.indexOf('state') !== -1
      let component = <ColorPicker {...field} />
      let className = 'color-cell ' + (isState ?
                      'color-minor' :
                      'color-display')

                   return   <div className={className}>{component}</div>

    case "string": return (field.enum) ?
                            <EnumToggle {...field} /> :
                            <EditorMini {...field} />

    case "integer": return  <Slider {...field} />

    case "boolean": return  <Toggle {...field} />

    default:        return  <EditorMini {...field} />
  }}

const BaseSubSection = ({children, title, description}) => {

  if (title)
    title = <h3>{title}</h3>

  if (description)
    description = <div className='description'>{description}</div>

  let header = null
  if(title || description)
    header = <header className='controls sub-section-heading'>
      {title}
      {description}
    </header>
  return (
    <article className='sub-section'>
      {header}
      <section className='controls sub-section-body'>
      {children}
      </section>
    </article>
  )
}
const generateSettingsContent = (key) => {
  let fields = getFieldsFor(key)
  let icon = 'ios-browsers'
  let children = fields.map((field, n) => generateInputField(n, {...field, icon}))
  console.warn(children);
  // let conf = atom.config.getSchema(`reduced-dark-ui.${key}`)
  // let { type, title, description } = conf
  return (
    <BaseSubSection>
      {children}
    </BaseSubSection>
  )
}


const generateIconSettingsContent = () => {
  let key = 'icons'
  let scope = `reduced-dark-ui.${key}`
  let fields = atom.config.get(scope)
  let {title, description} = atom.config.getSchema(scope)
  let content = Object.keys(fields).map(name => {
    let field = fields[name]
    let onSuccess = (e, val) => {
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
  })
  return (
    <BaseSubSection title={title} description={description}>
      {content}
    </BaseSubSection>
  )
}


const generateFontSettingsContent = () => {

    let key = 'decor.uiFont'
    let scope = `reduced-dark-ui.${key}`
    let font = atom.config.get(scope)
    let {title, description} = atom.config.getSchema(scope)
    let exeq = (...a) => new Promise(resolve => {
      let task = Task.once(require.resolve('../../proc/provide-fonts.js'), ...a)
      //,mgr => resolve(mgr))
      task.on('load', data => resolve(data))
    })
    let dispatcher = exeq('families', font, 'google')
    let lastChange = Date.now()
    let content =
      <div className='control-group'>

        <Icon icon="ios-arrow-right" iconset='ion' />
        Font family

        <QueryField
          adapter={dispatcher}
          initialValue={font}
          onUpdate={val => {
            let v = val || font
            let dt = (Date.now() - lastChange) / 1000
            if (dt < 1)
              return
            console.log(val, v)
            let fontFaceDef = exeq('font-face', v, 'google')
            console.log(fontFaceDef)
            atom.config.set(scope, v)
            lastChange = Date.now()
            fontFaceDef.then(
              data => applyFont(data))
          }}
        />
      </div>

    return (
    <BaseSubSection title={title} description={description}>
      {content}
      <ConfigInputField type='select' scope='decor.uiFontWeight' />
    </BaseSubSection>
    )
}
