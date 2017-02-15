'use babel'

import { render } from 'react-dom'
import React from 'react'
import TabbedView from '../../components/TabbedView'
import EmbedSection from '../../components/layout/EmbedSection'
import { LayoutSection, ColorSection, TypographySection, IconsSection } from '../index'

export default function addTabView ({readme, details}) {

  let el = document.createElement('section')
  let component = render((

    <TabbedView>

      <EmbedSection
        title='details'
        description='Package information'
        icon='ios-home-outline' content={details} />

      <EmbedSection
        title='readme'
        description='Package README.md'
        icon='ios-book-outline' content={readme} />

      <LayoutSection
        title='layout'
        icon='ios-browsers-outline' />

      <ColorSection
        title='color'
        icon='ios-color-filter-outline' />

      <TypographySection
        title='fonts'
        icon='ios-compose-outline' />

      <IconsSection
        title='icons'
        icon='ios-albums-outline' />

    </TabbedView>),

    el)

  el.setAttribute('class', 'package-config-view')
  return el
}

    //   <Section title='layout' icon='ios-browsers' type='config'>
    //     {generateSettingsContent('layout')}
    //   </Section>
    //
    //   <section title='color' icon='ios-color-filter-outline' type='config'>
    //     {generateSettingsContent('palette')}
    //   </section>
    //
    //   <section title='miscellaneous' icon='ios-monitor-outline' type='config'>
    //     {generateFontSettingsContent()}
    //     <ConfigInputField type='boolean' scope='decor.overrideEditorBackground' />
    //     <ConfigInputField type='boolean' scope='decor.enhancedFx' />
    //   </section>
    //
    //   <section title='icons' icon='ios-pricetag' type='config'>
    //     {generateIconSettingsContent()}
    //   </section>
    //
    //   <section title='environment' icon='ios-settings' type='config'>
    //     {generateSettingsContent('env')}
    //   </section>
    //
    // </TabbedView>
