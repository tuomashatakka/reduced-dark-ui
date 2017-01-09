'use babel'

import React from 'react'
import addSlider from '../components/Slider'
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

  editors.each((n, element) => {
    // if (this.attr('id') == identifiers.uiScale)
    let options = {
      element,
      context,
      initialValue: atom.config.get(identifiers.uiScale),
    }

    let subscription = addSlider(options)
  })
}

export {
  observeSettingsPanel
}
