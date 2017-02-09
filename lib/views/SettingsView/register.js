'use babel'


import os from 'path'
import addTabView from './adapter'
import { CompositeDisposable } from 'atom'
const settingsViewPackage = atom.packages.getLoadedPackage('settings-view')
const name = 'reduced-dark-ui'
const subscriptions = new CompositeDisposable()


export const

  isSettingsOpen = (item) =>
    (item && item.uri === 'atom://config'),

  patch = item =>
    isSettingsOpen(item) ?
    extendCallbackFor({name, item}) : null,

  observeSettingsPanel = () => {
    let initial = atom.workspace.paneForURI('atom://config')
    if (initial)
      extendCallbackFor({name, item: initial.activeItem})

    subscriptions.add(
      atom.packages.onDidActivateInitialPackages(patch))

    subscriptions.add(
      atom.workspace.observeActivePaneItem(patch))

    subscriptions.add(
      atom.workspace.onDidChangeActivePaneItem(patch))

    if(settingsViewPackage)
      settingsViewPackage.onDidDeactivate(
        () => subscriptions.dispose())
  },

  extendCallbackFor = ({item, name}) => {
    let pack = atom.packages.getLoadedPackage(name)
    let spack = atom.packages.getLoadedPackage('settings-view')
    let settingsView = document.querySelector('.settings-view')
    let settingsModulePath = os.dirname(spack.getMainModulePath())
    let PackageDetailView = require(os.join(settingsModulePath, 'package-detail-view'))
    if (!settingsView) return
    let { spacePenView } = settingsView
    if (!spacePenView) spacePenView = settingsView.item
    if (!spacePenView) return

    const getCustomThemeView = () => {
      try {
        let panel = new PackageDetailView(
          atom.packages.getActivePackage('reduced-dark-ui'),
          spacePenView.packageManager, {getSnippets: ()=>[]})
        let settingsSect = panel.sections.find('section.settings-panel')
        let readme = panel.sections.find('.package-readme')
        let initial = readme.html()
        let tabbedContainer = addTabView({ initial })

        spacePenView.removePanel('reduced-dark-ui')
        settingsSect.before(tabbedContainer)
        readme.closest('section.section').hide()
        settingsSect.hide()
        spacePenView.panel = panel
        if (subscriptions)
            subscriptions.dispose()
        return panel }
        catch (e) { if (atom.devMode) console.warn("error at settings view creation callback:", e) }}

    spacePenView.panelCreateCallbacks = {
      ...spacePenView.panelCreateCallbacks,
      [name]: getCustomThemeView}

    if (spacePenView && spacePenView.activePanel && spacePenView.activePanel.name === 'reduced-dark-ui') {
      getCustomThemeView()
      if (spacePenView.back)
        spacePenView.showPanel('reduced-dark-ui')}}


export default observeSettingsPanel
