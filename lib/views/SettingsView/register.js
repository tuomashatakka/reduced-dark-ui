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

    let initial = atom.workspace.paneForURI('atom://config')

    if (initial)
      extendCallbackFor({name, item: initial.activeItem})

    let listeners = [
      atom.packages.onDidActivateInitialPackages(patch),
      atom.workspace.onDidOpen(patch),
      atom.workspace.onDidChangeActivePaneItem(patch)]

    for (let listener of listeners) {
      subscriptions.add(listener) }

    settingsViewPackage.onDidDeactivate(subscriptions.dispose)
  },


  extendCallbackFor = ({item, name}) => {

    // TODO: Implement the fuck outta this! id:10
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

          let settingsSect = panel.sections.find('section.settings-panel')
          let readme = panel.sections.find('.package-readme')
          let initial = readme.html()
          let tabbedContainer = addTabView({ initial })

          settingsSect.before(tabbedContainer)
          readme.closest('section.section').hide()
          settingsSect.hide()

          subscriptions.dispose()
          spacePenView.panel = panel
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
