'use babel'
import React from 'react'
import { Task } from 'atom'
import { applyFont } from '../core/configuration'
import { QueryField } from '../components/QueryField'
import { Icon } from '../components/base'
import Field from '../components/layout/Field'
import { PACKAGE_NAME } from '../constants'


const FontQueryField = (props) => {

  let { scope } = props
  let lastChange = Date.now()
  scope = `${PACKAGE_NAME}.${scope}`
  let font = atom.config.get(scope)
  // let {title, description} = atom.config.getSchema(scope)
  let exeq = (...a) => new Promise(resolve => {
    let task = Task.once(require.resolve('../proc/provide-fonts.js'), ...a)
    task.on('load', data => resolve(data)) })

  let dispatcher = exeq('families', font, 'google')
  let content =
    <label className='control-group'>

      <Icon icon="ios-arrow-right" iconset='ion' />
      Font family

      <div className='controls'>
        <QueryField
          adapter={dispatcher}
          initialValue={font}
          onUpdate={val => {
            let v = val || font
            // let dt = (Date.now() - lastChange) / 1000
            // console.log(v)
            // if (dt < 1)
            //   return
            let fontFaceDef = exeq('font-face', v, 'google')
            atom.config.set(scope, v)
            // lastChange = Date.now()
            fontFaceDef.then(data => {
                console.log("DATA GOT:", data)
                applyFont(data)
              })
              .catch(e => console.warn("ERROR", e))
          }}
        />
      </div>
    </label>
  return content
}
const TypographySection = (props) => {

  return (
    <section className='section'>

      <FontQueryField scope='decor.uiFont' style='primary' />
      <Field scope='decor.uiFontWeight' style='primary' />
      <Field scope='env.GOOGLE_API_KEY' style='primary' />

    </section>
  )
}
export default TypographySection
