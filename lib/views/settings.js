'use babel'

import React from 'react'
import addSlider from '../components/Slider'
import chooseIcon from '../components/IconPicker'
import os from 'path'


const identifiers = {
  uiScale: 'reduced-dark-ui.layout.uiScale',
}

const isSettingsOpen = (item) =>
  (item.uri === 'atom://config')

const observeSettingsPanel = () => {
  let pack = atom.packages.getLoadedPackage('settings-view')
  let settingsModulePath = os.dirname(pack.getMainModulePath())

  return atom.workspace.onDidOpen(

    item => isSettingsOpen(item)
          ? renderSliders(item)
          : null)
}

/**
 * Adds a slider under the UI scale value input
 * @method renderScaleSlider
 * @param  {HTMLNode}          item The html element for the settings view
 */
const renderSliders = ({ item }) => {

  if (!item || !item.panelsByName)
    return

  let pack = item.panelsByName['reduced-dark-ui']
  if (!pack)
    pack = item.getOrCreatePanel('reduced-dark-ui')
    console.log(pack)

    if (!pack)
      return

  let { element: context, sections } = pack
  let editors = sections.find('atom-text-editor[type="number"]')
  let icons   = sections.find('.sub-section-heading').filter((x,o)=>o.textContent.toLowerCase()==='icons').next('.sub-section-body').children('.control-group')
  let iconSections

  editors.each((n, element) => {
    // if (this.attr('id') == identifiers.uiScale)
    let options = {
      element,
      context,
      initialValue: atom.config.get(identifiers.uiScale),
    }

    let subscription = addSlider(options)
  })

  // Replace prefixes from titles
  let t = icons.find('h3, label')
  t.each(
    (x,o) => o.textContent =
    o.textContent.startsWith('Icons ') ?
    o.textContent.substr(6) :
    o.textContent)

  icons.each((n, element) => {
    console.log(icons);
    try {
      console.log(n, element)
      let ed = element.querySelectorAll('atom-text-editor')
      console.log(element, ed);
      ed.forEach(editor => editor.addEventListener(
        'click',
        e => {
          console.log(editor.getModel().getText(), e)
          chooseIcon().show()
        }
      ))
      element.addEventListener('click', chooseIcon)
    }
    catch (e) {
      console.warn(e)
    }
  })
}

export {
  observeSettingsPanel
}
