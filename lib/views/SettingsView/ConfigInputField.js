'use babel'
import React from 'react'
import { getFieldsFor, BaseSubSection } from './ConfigSection'
import { Toggle, EnumToggle, EditorField } from '../../components/input'


const ConfigInputField = (opts) => {
  let {scope, type} = opts
  let Field
  if (type === 'boolean')
    Field = Toggle
  else if (type === 'select')
    Field = EnumToggle
  else
    Field = EditorField
  let icon = 'ios-pulse'
  let value = atom.config.get(`reduced-dark-ui.${scope}`)
  let onChange = val => atom.config.set(`reduced-dark-ui.${scope}`, val)
  let path = scope.split('.')
  let key = path.pop()
  let props = { ...opts[key], onChange, key, value, icon }

  return <Field {...props} />
}


export const inputField = (name, attrs={}) => {
  let field = getFieldsFor(name)
  let icon = attrs.icon || 'ios-browsers'
  field = generateInputField(name, {...field, icon})
  return (
    <BaseSubSection>
      {field}
    </BaseSubSection>
  )

}

export const generateInputField = (name, attrs) => {

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
                            <EditorField {...field} />

    case "integer": return  <Slider {...field} />

    case "boolean": return  <Toggle {...field} />

    default:        return  <EditorField {...field} />
  }}


export default ConfigInputField
