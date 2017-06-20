'use babel'

import addTabView from './adapter'
import { PACKAGE_NAME } from '../../constants'
import { formatTitle } from '../../utils'
import os from 'path'

export default addTabView

let themePanel
let configUri = 'atom://config'
let configProps = {}

const isSettingsView = view =>
  view && view.uri && view.uri.startsWith(configUri)

/**
 * Get the specific module of the settings-view package
 * by its filename
 *
 * @method settingsPackageProp
 * @param  {string}            [filename='settings-view'] Filename for the required module
 *                                                        excluding the filetype suffix
 * @return {module}            Found module if one exists, otherwise null
 */

const settingsPackageProp = (filename='settings-view') => {
  if (configProps[filename])
    return configProps[filename]
  let spack = atom.packages.getLoadedPackage('settings-view')
  let settingsModulePath = os.dirname(spack.getMainModulePath())
  configProps[filename] = require(os.join(settingsModulePath, filename))
  return configProps[filename]
}

/**
 * Start watching for pane item changes to capture the
 * settings view open event
 *
 * @method observeThemeView
 * @return {Disposable}         The disposable for the pane item change listener
 */

export function observeThemeView () {
  return atom.workspace.onDidStopChangingActivePaneItem(view => {
    console.info("did stop changing", {view})
    if (isSettingsView(view)) {
      let getView = () => getCustomThemeView({ settingsView: view })
      // disposable.dispose()
      view.addCorePanel(formatTitle(PACKAGE_NAME), 'rocket', getView)
      view.addPanel(PACKAGE_NAME, getView)
    }
  })
}

/**
 * Create callback for the package's detail view.
 *
 * @method getCustomThemeView
 * @param  {SettingsView}     settingsView An instance of SettingsView
 * @return {PackageDetailView}             The modified packageDetailView to be displayed
 *                                         in the settings view
 */

export function getCustomThemeView ({ settingsView }) {

  if (themePanel)
    return themePanel

  const PackageDetailView = settingsPackageProp('package-detail-view')
  const themePackage = atom.packages.getLoadedPackage('reduced-dark-ui')

  // For the sake of compatibility, the default
  // PackageDetailView that would normally be displayed
  // is used as a basis for the custom view
  let panel = new PackageDetailView(
      themePackage,
      settingsView,
      settingsView.packageManager,
      settingsView.snippetsProvider)

  // Get the default details and readme sections of
  // the package's detail view and pass them to the
  // tabbed view that is created for the replacement
  // of the regular view
  let readme = panel.readmeView.packageReadme
  let details = panel.element.children[1]
  let tabbedContainer = addTabView({ readme, details })

  // Set the default value for the back property
  // I'm not sure why this needs to be done but it is
  // the only way I got the panel to render in all circumstances
  panel.beforeShow = (opts={ back: 'Themes' }) =>
    PackageDetailView.beforeShow ? PackageDetailView.beforeShow(opts) : null

  // Detach the default sections view from the PackageDetailView
  panel.refs.sections.classList.add('hidden')

  // Append the generated custom view for the PackageDetailView
  panel.element.appendChild(tabbedContainer)

  // Cache the generated panel so it won't have to be
  // regenerated on subsequent package view opens
  themePanel = panel
  return panel
}
