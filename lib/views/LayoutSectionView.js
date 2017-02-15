'use babel'
import React from 'react'
import Field from '../components/layout/Field'

const LayoutSection = (props) => {
  return (
    <section className='section'>

      <header className='section-header'>
        <h1>Layout and user interface</h1>
        <em>{props.description}</em>
      </header>

      <Field scope='layout.uiScale' style='primary' />
      <Field scope='layout.spacing' style='primary' />

      <Field scope='decor.overrideEditorBackground' style='secondary' />
      <Field scope='layout.SILLYMODE' style='minor' />
    </section>
  )
}
export default LayoutSection
