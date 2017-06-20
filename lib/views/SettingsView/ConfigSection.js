'use babel'
import React from 'react'
import { generateInputField } from './ConfigInputField'
import { flatten } from '../../utils'
const schema = atom.config.getSchema('reduced-dark-ui')
const conf = flatten(schema.properties)


const ConfigSection = (key) => {
  let fields = getFieldsFor(key)
  let icon = 'ios-browsers'
  let children = fields.map((field, n) => generateInputField(n, {...field, icon}))
  // let conf = atom.config.getSchema(`reduced-dark-ui.${key}`)
  // let { type, title, description } = conf
  return (
    <BaseSubSection>
      {children}
    </BaseSubSection>
  )
}

export default ConfigSection

export const BaseSubSection = ({children, title, description}) => {

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


export const getFieldsFor = (key) => {
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
