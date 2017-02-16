'use babel'
import React from 'react'
import Field from '../components/layout/Field'

const LayoutSection = (props) => {
  return (
    <section className='section'>

      <Field scope='layout.uiScale' style='primary' />
      <Field scope='layout.spacing' style='primary' />

      <Field scope='layout.fixedTabBar' style='minor' />
      <Field scope='layout.fixedProjectRoot' style='minor' />

      <Field scope='layout.collapsing' style='major' />

      <Field scope='layout.tabPosition' style='minor' />
      <Field scope='layout.tabClosePosition' style='minor' />

      <Field scope='layout.SILLYMODE' style='minor' />
      <Field scope='decor.animations.duration' style='minor' />

    </section>
  )
}
export default LayoutSection
