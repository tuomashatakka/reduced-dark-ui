'use babel'
import React from 'react'
import chooseIcon from '../components/IconPicker'
import { Icon, Button } from '../components/base'
import panels from '../core/panels'

const PACKAGE_NAME = 'reduced-dark-ui'


const IconsSection = () => {

  let scope = `${PACKAGE_NAME}.icons`
  let icons = atom.config.get(scope)
  let content = Object.keys(icons).map((name, xo) => {

    let field = icons[name]
    let onSuccess = (e, val) => {

      atom.config.set(scope, { ...icons, [name]: val })
      field = { ...field, ...val }
      panels().emit(
        'change',
        { name, ...val })
    }

    return (
      <div className='control-group' key={xo} onClick={() => chooseIcon({ onSuccess })}>
        <Icon {...field} />
        {name}
      </div>
    )

  })

  return (
    <section className='section'>
      {content}
    </section>
  )
}
export default IconsSection
