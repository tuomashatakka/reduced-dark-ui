'use babel'

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
  let sub = atom.workspace.onDidChangeActivePaneItem(
    item => isSettingsOpen(item)
    ? extendCallbackFor('reduced-dark-ui', item)
    : null)
  pack.onDidDeactivate(() => sub.dispose())

  return sub
}

let activated = false
const extendCallbackFor = (name='reduced-dark-ui', settingsView) => {

  if (activated)
    return

  settingsView = settingsView.item || document.querySelector('.settings-view')

  if (!settingsView)
    return

  let { spacePenView } = settingsView
  if (!spacePenView)
    spacePenView = settingsView.item

  if (!spacePenView || activated)
    return

  let pack = atom.packages.getLoadedPackage(name)
  let panel = spacePenView.getOrCreatePanel(name, { pack })

  if (!panel)
    return

  renderSliders(panel)
  spacePenView.panelCreateCallbacks = {
    ...spacePenView.panelCreateCallbacks,
    [name]: () => panel
  }
  activated = true

}

/**
 * Adds a slider under the UI scale value input
 * @method renderScaleSlider
 * @param  {HTMLNode}          item The html element for the settings view
 */
const renderSliders = ( panel ) => {

  let { element: context, sections } = panel
  let editors   = sections
      .find('atom-text-editor[type="number"]')

  let icons     = sections
      .find('.sub-section-heading')
      .filter((x,o)=>o.textContent.toLowerCase()==='icons')
      .next()
      .find(".sub-section")

  let textfields = sections
      .find('atom-text-editor[type="string"]')

  let iconSections

  // Append slider input widgets
  editors.each((n, element) => {
    let options = {
      element,
      context,
      initialValue: atom.config.get(identifiers.uiScale),
    }

    let subscription = addSlider(options)
  })


  // Replace prefixes from icon sections' titles
  let t = icons.find('h3, label')
  t.each(
    (x,o) => o.textContent =
    o.textContent.startsWith('Icons ') ?
    o.textContent.substr(6) :
    o.textContent)

  // Bind icon text fields into modal open handler
  icons.addClass('icon-selector')
  icons.each((n, element) => {
    try {
      let ed = element.querySelectorAll('atom-text-editor')
      let override = document.createElement("div")
      let changeButton = document.createElement("a")
      let [ iconField, iconSetField ] = ed

      const iconPreview = () =>
        makeIcon({
          iconset: iconSetField.getModel().getText(),
          icon: iconField.getModel().getText(),
          className: 'preview-icon'
        })
      const setValues = ({ icon, iconset }) => {
        iconField.getModel().setText(icon.toString())
        iconSetField.getModel().setText(iconset.toString())
      }
      const onSuccess = (successButtonClickEvent, details) => {
        //let { iconset, icon } = details
        setValues(details)
        override.replaceChild(
          iconPreview(),
          override.querySelector('.preview-icon'))
        decorate()
      }

      element
        .appendChild(override)
      element
        .querySelector('.sub-section-body')
        .setAttribute('style', 'display: none')

      override
        .appendChild(iconPreview())
      override
        .appendChild(changeButton)
      override
        .classList.add('icon-section')

      changeButton
        .setAttribute('class', 'btn btn-default')
      changeButton
        .textContent = "Change icon"
      changeButton
        .addEventListener('click', () =>
          chooseIcon({ onSuccess }))
      // ed.forEach(editor => editor.addEventListener(
      //   'click',
      //   e => chooseIcon({ onSuccess: (...a) => onSuccess(...a) })
      // ))
      //element.addEventListener('click', chooseIcon)
    }
    catch (e) {
      console.warn(e)
    }
  })

  textfields.each((n, element) => {
    if (element.getAttribute('id') == 'reduced-dark-ui.decor.uiFont') {
      let qf = QueryField({ element })
      element.style.display = "none"
    }
  })
}

export {
  observeSettingsPanel
}
