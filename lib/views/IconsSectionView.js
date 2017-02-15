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
    console.log(field, xo)
    let onSuccess = (e, val) => {
      atom.config.set(scope, { ...icons, [name]: val })
      field = { ...field, ...val }
      panels().emit('change', { name, ...val })
    }
    return (
      <div className='control-group' key={xo}>
        <Icon {...field} />
        {name}
        <Button onClick={() => chooseIcon({ onSuccess })}>
          Change
        </Button>
      </div>
    )
  })
  return (
    <section className='section'>

      <header className='section-header'>
        <h1>Icons</h1>
        <em>Panel toggle icons</em>
      </header>

      {content}

    </section>
  )
}
export default IconsSection
