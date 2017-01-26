'use babel'


import { addTabView } from '..'
import os from 'path'

const settingsViewPackage = atom.packages.getLoadedPackage('settings-view')
export const

  isSettingsOpen = (item) =>
    (item && item.uri === 'atom://config'),

  observeSettingsPanel = () => {
    let name = 'reduced-dark-ui'
    let sub = atom.workspace.onDidChangeActivePaneItem(
      item => {
        console.log(item, name);
        return isSettingsOpen(item) ?
          extendCallbackFor({name, item}) : null
    })

    settingsViewPackage.onDidDeactivate(
      () => sub.dispose())
  },


  extendCallbackFor = ({item, name='reduced-dark-ui'}) => {
    try {

      // TODO: Implement the fuck outta this!
      // settingsView = settingsView.item || document.querySelector('.settings-view')

      let pack = atom.packages.getLoadedPackage(name)
      let spack = atom.packages.getLoadedPackage('settings-view')
      let settingsView = document.querySelector('.settings-view')
      let settingsModulePath = os.dirname(spack.getMainModulePath())
      let PackageDetailView = require(os.join(settingsModulePath, 'package-detail-view'))
      console.log(settingsModulePath, name, pack)


      let { spacePenView } = settingsView
      let snippetsProviderDummtDumyt = (getSnippets: ()=>[])
    }
    catch (e) {
      console.log("error at activation o custom zettings:", e)
      return
    }

    if (!settingsView) return
    if (!spacePenView) spacePenView = settingsView.item

    spacePenView.panelCreateCallbacks = {
      ...spacePenView.panelCreateCallbacks,
      [name]: () => {
        try {

          let panel = new PackageDetailView(
            atom.packages.getActivePackage('reduced-dark-ui'),
            spacePenView.packageManager,
            snippetsProviderDummtDumyt)

          let ell = document.createElement('section')
          let el = addTabView(ell)

          panel.sections.find('section.settings-panel').append(ell)
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
        catch (e) {
          console.warn("error at panel creation callback:", e);
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
