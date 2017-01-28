'use babel'


import { addTabView } from './adapter'
import os from 'path'
import { CompositeDisposable } from 'atom'

const settingsViewPackage = atom.packages.getLoadedPackage('settings-view')
const name = 'reduced-dark-ui'
const subscriptions = new CompositeDisposable()

export const

  isSettingsOpen = (item) =>
    (item && item.uri === 'atom://config'),

  patch = item => {
    return isSettingsOpen(item) ?
    extendCallbackFor({name, item}) : null
  },

  observeSettingsPanel = () => {


    let listeners = [
      atom.packages.onDidActivateInitialPackages(patch),
      atom.workspace.onDidChangeActivePaneItem(patch)
    ]

    for (let listener of listeners) {
        subscriptions.add(listener) }

    settingsViewPackage.onDidDeactivate(subscriptions.dispose)
  },


  extendCallbackFor = ({item, name='reduced-dark-ui'}) => {

    // TODO: Implement the fuck outta this!
    console.warn("CALLBVK EXTENSIN FOR THEME SETTINGS", item)
    let pack = atom.packages.getLoadedPackage(name)
    let spack = atom.packages.getLoadedPackage('settings-view')
    let settingsView = document.querySelector('.settings-view')
    let settingsModulePath = os.dirname(spack.getMainModulePath())
    let PackageDetailView = require(os.join(settingsModulePath, 'package-detail-view'))

    if (!settingsView) return
    let { spacePenView } = settingsView
    let voidSnippetProvider = {getSnippets: ()=>[]}
    if (!spacePenView) spacePenView = settingsView.item
    if (!spacePenView) return

    spacePenView.panelCreateCallbacks = {
      ...spacePenView.panelCreateCallbacks,
      [name]: () => {
        try {

          let panel = new PackageDetailView(
            atom.packages.getActivePackage('reduced-dark-ui'),
            spacePenView.packageManager,
            voidSnippetProvider)
          let tabbedContainer = addTabView()

          panel
          .sections
          .find('section.settings-panel')
          .before(tabbedContainer)

          spacePenView.panel = panel
          subscriptions.dispose()
          return panel
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
