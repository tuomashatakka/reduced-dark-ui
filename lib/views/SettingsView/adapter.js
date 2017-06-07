'use babel'

import { render } from 'react-dom'
import React from 'react'
import TabbedView from '../../components/layout/TabbedView'
import EmbedSection from '../../components/layout/EmbedSection'
import { LayoutSection, ColorSection, TypographySection, IconsSection } from '../index'

export default function addTabView ({readme, details}) {

  let el = document.createElement('section')
  let component = render((

    <TabbedView>

      <EmbedSection
        title='details'
        description='Package information'
        icon='ios-home'
        content={details} />

      <LayoutSection
        title='layout'
        icon='ios-browsers' />

      <ColorSection
        title='color'
        icon='ios-color-filter' />

      <TypographySection
        title='fonts'
        icon='ios-compose' />

      <IconsSection
        type='icons'
        title='icons'
        icon='ios-albums' />

      <EmbedSection
        title='readme'
        description='Package README.md'
        icon='ios-book'
        content={readme} />

    </TabbedView>),

    el)

  el.setAttribute('class', 'package-config-view')
  return el
}
