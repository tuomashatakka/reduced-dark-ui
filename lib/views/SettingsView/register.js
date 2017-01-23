'use babel'


import { addTabView } from '..'
import os from 'path'


export const

  isSettingsOpen = (item) =>
    (item && item.uri === 'atom://config'),

  observeSettingsPanel = () => {
    let name = 'reduced-dark-ui'
    let pack = atom.packages.getLoadedPackage('settings-view')
    let settingsModulePath = os.dirname(pack.getMainModulePath())
    let sub = atom.workspace.onDidChangeActivePaneItem(
      item => {
        console.log(item, name);
        return isSettingsOpen(item) ?
               extendCallbackFor({name, item}) : null
    })

    pack.onDidDeactivate(
      () => sub.dispose()
    )
  },


  extendCallbackFor = ({item, name='reduced-dark-ui'}) => {
    // TODO: Implement the fuck outta this!
    // let pack = atom.packages.getLoadedPackage(name)
    // let settingsView = document.querySelector('.settings-view')
    // let el = document.createElement('section')
    //
    //
    // settingsView = settingsView.item || document.querySelector('.settings-view')
    //
    // if (!settingsView)
    //   return
    //
    // let { spacePenView } = settingsView
    // if (!spacePenView)
    //   spacePenView = settingsView.item
    //
    // console.log(spacePenView, settingsView, pack);
    // // if (!spacePenView || !spacePenView.panel || activated)
    // //  return
    //
    // // renderSliders(panel)
    // spacePenView.panelCreateCallbacks = {
    //   ...spacePenView.panelCreateCallbacks,
    //   [name]: () => {
    //     settingsView.appendChild(el)
    //     console.log(settingsView, el, name);
    //     console.log("OVERWRITING PACKAGE VIEW'S ELEMENT", spacePenView.element);
    //     spacePenView.element.prepend(el)
    //     return {
    //       getTitle: () => name,
    //       item: addTabView(el),
    //       panel: el,
    //     }
    //   }}
    //   console.log(spacePenView.panelCreateCallbacks)
    //
    //   let panel = spacePenView.getOrCreatePanel(name, { pack })
    //   panel.sections = [el]
    //   // panel.item = el
    //   console.log(el, panel, settingsView)

  }
