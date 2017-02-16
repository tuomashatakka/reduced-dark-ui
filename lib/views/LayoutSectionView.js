'use babel'
import React from 'react'
import Field from '../components/layout/Field'

const LayoutSection = (props) => {
  return (
    <section className='section'>

      <Field scope='layout.uiScale' style='primary' />
      <Field scope='layout.spacing' style='primary' />

      <Field scope='decor.overrideEditorBackground' style='secondary' />
      <Field scope='layout.SILLYMODE' style='minor' />
    </section>
  )
}
export default LayoutSection
