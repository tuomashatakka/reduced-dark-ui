'use babel'

import dev from '../tools'
import React from 'react'
import { QueryField } from '../components'
import addSlider from '../components/Slider'
import chooseIcon from '../components/IconPicker'
import decorate from '../panels'
import { makeIcon } from '../core/icons'
import os from 'path'


const identifiers = {
  uiScale: 'reduced-dark-ui.layout.uiScale',
}

const isSettingsOpen = (item) =>
  (item && item.uri === 'atom://config')

const observeSettingsPanel = () => {
  let pack = atom.packages.getLoadedPackage('settings-view')
  let settingsModulePath = os.dirname(pack.getMainModulePath())
  let subs = [
  atom.workspace.onDidChangeActivePaneItem(
    item => isSettingsOpen(item)
    ? extendCallbackFor('reduced-dark-ui', item)
    : null),
  atom.workspace.onDidAddPaneItem(
    item => isSettingsOpen(item)
    ? extendCallbackFor('reduced-dark-ui', item)
    : null),
  atom.workspace.onDidOpen(
    item => isSettingsOpen(item)
    ? extendCallbackFor('reduced-dark-ui', item)
    : null)]
  return subs
}

let activated = false
const extendCallbackFor = (name='reduced-dark-ui', settingsView) => {
  settingsView = settingsView.item || document.querySelector('.settings-view')

  if (!settingsView)
    return

  let { spacePenView } = settingsView
  if (!spacePenView)
    spacePenView = settingsView.item
  if (!spacePenView)
    return

  if (activated)
    return

  let pack = atom.packages.getLoadedPackage(name)
  console.log(pack);

  let panel = spacePenView.getOrCreatePanel(name, { pack })
  console.log("Created panel:", panel);

  if (panel) {
    renderSliders(panel)
  }

  spacePenView.panelCreateCallbacks = {
    ...spacePenView.panelCreateCallbacks,
    [name]: () => panel
  }
  return
  spacePenView.panelCreateCallbacks[name] = (...args) => {
    if (activated)
      return

    activated = true
    console.log(name + ' panel activated', args);
    console.log('Deferred panel', spacePenView.deferredPanel);

    let { deferredPanel } = spacePenView
    let options = {}

    console.log('Deferred panel', deferredPanel);
    spacePenView.deferredPanel = { name, options }
    spacePenView.showDeferredPanel()

    spacePenView.deferredPanel = null
  }
}

/**
 * Adds a slider under the UI scale value input
 * @method renderScaleSlider
 * @param  {HTMLNode}          item The html element for the settings view
 */
const renderSliders = ( panel ) => {

  let { element: context, sections } = panel
  console.log("RENDER CALL", context, sections, panel);
  let editors   = sections.find('atom-text-editor[type="number"]')
  let icons     = sections.find('.sub-section-heading').filter((x,o)=>o.textContent.toLowerCase()==='icons').next().find(".sub-section")
  let selects   = sections.find('select')
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

  icons.addClass('icon-selector')

  // Replace prefixes from icon sections' titles
  let t = icons.find('h3, label')
  t.each(
    (x,o) => o.textContent =
    o.textContent.startsWith('Icons ') ?
    o.textContent.substr(6) :
    o.textContent)

  // Bind icon text fields into modal open handler
  icons.each((n, element) => {
    try {
      let ed = element.querySelectorAll('atom-text-editor')
      let override = document.createElement("div")
      let changeButton = document.createElement("a")
      let [ iconField, iconSetField ] = ed
      let iconset = iconSetField.getModel().getText()
      let icon = iconField.getModel().getText()
      let iconPreview = (iconset, icon) =>
          makeIcon({ iconset, icon, className: 'preview-icon' })
      if (element.querySelector('.preview-icon'))
        override = element.children[element.children.length-1]

      override.classList.add('icon-section')
      changeButton.setAttribute('class', 'btn btn-default')
      changeButton.textContent = "Change icon"

      const onSuccess = (successButtonClickEvent, details) => {
        let { iconset, icon } = details
        iconField.getModel().setText(icon.toString())
        iconSetField.getModel().setText(iconset.toString())
        override.replaceChild(
          iconPreview(iconset, icon),
          override.querySelector('.preview-icon'))
        decorate()
      }

      element.appendChild(override)
      element
        .querySelector('.sub-section-body')
        .setAttribute('style', 'display: none')

      override
        .appendChild(iconPreview(iconset, icon))
      override.appendChild(changeButton)
      changeButton.addEventListener('click', e => chooseIcon({ onSuccess }))
      ed.forEach(editor => editor.addEventListener(
        'click',
        e => chooseIcon({ onSuccess: (...a) => onSuccess(...a) })
      ))
      //element.addEventListener('click', chooseIcon)
    }
    catch (e) {
      console.warn(e)
    }
  })

  selects.each((n, element) => {
    console.log(element)
    console.log(QueryField)
    let qf = QueryField({
      element
    })
    console.log(qf)
  })
}

export {
  observeSettingsPanel
}
