'use babel'
import React from 'react'
import Field from '../components/layout/Field'

const ColorSection = () => {
  return (
    <section className='section'>

      <header className='section-header'>
        <h1>Niece colors n al</h1>
      </header>

      <Field scope='palette.primary'          style='primary-color' />
      <Field scope='palette.accentColor'      style='primary-color' />
      <Field scope='palette.backgroundTint'   style='primary-color' />
      <Field scope='palette.state.success'    style='state-color' />
      <Field scope='palette.state.warning'    style='state-color' />
      <Field scope='palette.state.annotation' style='state-color' />
      <Field scope='palette.state.error'      style='state-color' />

    </section>
  )
}
export default ColorSection
