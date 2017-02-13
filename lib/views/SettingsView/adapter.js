'use babel'

import React from 'react'
import chooseIcon from '../../components/IconPicker'
import TabbedView from '../../components/TabbedView'
import EmbedSection from '../../components/layout/EmbedSection'
import { render } from 'react-dom'
import { Icon, Button } from '../../components/base'
import { LayoutSection, ColorSection, TypographySection, IconsSection } from '../index'

export const addTabView = ({readme, details}) => {

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

}
export default addTabView


const generateIconSettingsContent = () => {
  let key = 'icons'
  let scope = `reduced-dark-ui.${key}`
  let fields = atom.config.get(scope)
  let {title, description} = atom.config.getSchema(scope)
  let content = Object.keys(fields).map(name => {
    let field = fields[name]
    let onSuccess = (e, val) => {
      atom.config.set(scope, {...fields, [name]: val})
      field = val
    }
    return (
      <div className='control-group'>
        <Icon {...field} />
        {name}
        <Button onClick={()=>chooseIcon({ onSuccess })}>
          Change
        </Button>
      </div>
    )
  })
  return (
    <BaseSubSection title={title} description={description}>
      {content}
    </BaseSubSection>
  )
}
