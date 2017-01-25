'use babel'

import dev from './tools'
import fs from 'fs'
import os from 'path'
import getComposite from './core/subscribe'
import decorate, { applyModalBackdropBlur } from './panels'
import { flatten, namespace, createFile } from './utils'
import { setScale } from './scale'
import { fetchIconLists } from './core/icons'
import { fetchFontLists } from './core/fonts'
import { applyConfig, applyFont, provideIconStylesheets } from './core/configuration'

import { devs } from './views/settings'
import { observeSettingsPanel } from './views/SettingsView'
const

commands = {
  'reduced-dark-ui:decorate': () => decorate(),
  'reduced-dark-ui:reset-config': () => createFile('styles/definitions'),
  'reduced-dark-ui:update-stylesheets': () => applyConfig({
    config: theme.settings }),
  'reduced-dark-ui:provide-icon-stylesheets': () => provideIconStylesheets(),
  'reduced-dark-ui:update-fonts-listing': () => atom.devMode ? fetchFontLists() : null },

deferredTasks = [
  applyModalBackdropBlur,
  decorate,
  observeSettingsPanel,
  fetchIconLists,
  fetchFontLists ]

class Theme {

  constructor (name) {
    this.name = name
    this.settings = {}
    this.subscriptions = null
    // this.configManager = new Manager({ packageName: this.name })

    this.activate = this.activate.bind(this)
    this.deactivate = this.deactivate.bind(this)
    this.serialize = this.serialize.bind(this)
    this.listen = this.listen.bind(this)
    this.applyConfiguration = this.applyConfiguration.bind(this)
    this.bindSettings = this.bindSettings.bind(this)
  }

  activate (state) {

    let schema = atom.config.getSchema('reduced-dark-ui')
    this.subscriptions = getComposite()
    this.settings = flatten(schema.properties)

    devs()
    console.log(this.configManager);
    console.log(window.autobind);

    // Add commands to the command palette & get configuration settings
    let cmds = atom.commands.add('atom-workspace', commands)
    this.subscriptions.add(cmds)

    // Set up configuration change observers
    this.bindSettings()

    // Start the execution of the deferred tasks
    // (asynchronously in the background)

    for (let task in deferredTasks) {
      setImmediate(
        () => {
        try {
          deferredTasks[task]() }
        catch (e) {
          dev.message(
            'reduced-dark-ui: Execution of a deferred task was unsuccessful' +
            JSON.stringify(e)
          )
        }
      })
    }
  }

  serialize (...args) {
    return {
      state: [args]
    }
  }

  deactivate () {
    this.subscriptions.dispose()
  }

  bindSettings () {

    // TODO: Move to the ConfigManager class!
    for (let key in this.settings) {

      let callback,
          item = this.settings[key],
          is = (n) => key === n

      if (!item.branch)                   continue
      if (is('uiScale') || is('spacing')) callback = setScale
      else if (key == 'uiFont')           callback = applyFont
      else                                callback = applyConfig

      let path = item.path.concat([key])
      let value = item.value || false
      item = { ...item, path, value }

      let subscription = this.listen(item, callback)
      this.subscriptions.add(subscription)
    }
  }

  listen (item, callback) {
    let { value, type, path } = item
    let ns = namespace(path, true)

    return atom.config.observe(
      ns, val => this.applyConfiguration(path, val || value, type, callback)
    )
  }

  applyConfiguration (path, value, type, callback) {
    let key = path[path.length-1]
    let attrs = [ 'uiScale', 'spacing', 'uiFont' ]
    let shouldWriteToDom = attrs.indexOf(key) !== -1
    let ns = namespace(key)
    this.settings[key].value = value
    let config = this.settings

    if (shouldWriteToDom)
      document.documentElement.setAttribute(ns, value)

    callback({ value, key, config })
  }
}


const appendDependencyToVariablesStyle = () => {
  let pkg = atom.packages.getLoadedPackage('reduced-dark-ui')
  let store = atom.getStorageFolder()
  let stylesPath = os.join(pkg.path, 'styles')
  let variablesFilePath = os.join(stylesPath, 'ui-variables.less')
  let configPath = store.pathForKey(pkg.name)
  let configFilePath = os.join(configPath, 'config.less')
  let contents = fs.readFileSync(variablesFilePath)

  let start = contents.utf8Slice(0, 100)
  if (start.search('import') === -1) {
    fs.writeFileSync(variablesFilePath, `@import '${configFilePath}';\n${contents}`)
    return true
  }
  return false
}

appendDependencyToVariablesStyle()

let theme
export default {
  activate: () => {
    theme = new Theme('reduced-dark-ui')
    appendDependencyToVariablesStyle()
    theme.activate()
  },
  deactivate: () => {
    theme.deactivate()
  }
}
