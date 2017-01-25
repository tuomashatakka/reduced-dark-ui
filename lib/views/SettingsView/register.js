'use babel'


import { addTabView } from '..'
import os from 'path'


export const

  isSettingsOpen = (item) =>
    (item && item.uri === 'atom://config'),

  observeSettingsPanel = () => {
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    console.log("observeSettingsPanel")
    let name = 'reduced-dark-ui'
    let pack = atom.packages.getLoadedPackage('settings-view')
    let sub = atom.workspace.onDidChangeActivePaneItem(
      item => {
        console.log(item, name);
        //return isSettingsOpen(item) ?
               extendCallbackFor({name, item})// : null
    })

    pack.onDidDeactivate(
      () => sub.dispose()
    )
  },


  extendCallbackFor = ({item, name='reduced-dark-ui'}) => {
    // TODO: Implement the fuck outta this!
    let pack = atom.packages.getLoadedPackage(name)
    let spack = atom.packages.getLoadedPackage('settings-view')
    let settingsView = document.querySelector('.settings-view')
    let settingsModulePath = os.dirname(spack.getMainModulePath())
    let PackageDetailView = require(os.join(settingsModulePath, 'package-detail-view'))
    console.log(settingsModulePath, name, pack)

    settingsView = settingsView.item || document.querySelector('.settings-view')
    let { spacePenView } = settingsView
    if (!spacePenView)
      spacePenView = settingsView.item

    spacePenView.panelCreateCallbacks = {
      ...spacePenView.panelCreateCallbacks,
      [name]: () => {
        let panel = new PackageDetailView(
          atom.packages.getActivePackage('reduced-dark-ui'),
          spacePenView.packageManager,
          {getSnippets: ()=>[]})
        let ell = document.createElement('section')
        panel.sections.find('section.settings-panel').append(ell)
        let el = addTabView(ell)
        spacePenView.panel = panel
        return panel
        // spacePenView.element.prepend(el)
        // settingsView.appendChild(el)
        console.log(settingsView, el, name);
        console.log("OVERWRITING PACKAGE VIEW'S ELEMENT", spacePenView.element);
        return {
          getTitle: () => name,
          panel,
        }
      }
    }
    console.log(spacePenView.panelCreateCallbacks)
    //
    //   let panel = spacePenView.getOrCreatePanel(name, { pack })
    //   panel.sections = [el]
    //   // panel.item = el
    //   console.log(el, panel, settingsView)

  }
