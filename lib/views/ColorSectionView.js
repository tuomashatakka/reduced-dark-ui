'use babel'
import React from 'react'
import Field from '../components/layout/Field'

const ColorSection = () => {
  return (
    <section className='section'>

      <Field scope='palette.primary'          style='primary-color' />
      <Field scope='palette.accentColor'      style='primary-color' />
      <Field scope='palette.backgroundTint'   style='primary-color' />
      <Field scope='palette.state.success'    style='state-color' />
      <Field scope='palette.state.warning'    style='state-color' />
      <Field scope='palette.state.annotation' style='state-color' />
      <Field scope='palette.state.error'      style='state-color' />

      <Field scope='decor.overrideEditorBackground' style='minor' />

    </section>
  )
}
export default ColorSection
