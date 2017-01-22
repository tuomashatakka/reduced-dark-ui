'use babel'

import dev from './tools'
import getComposite from './core/subscribe'
import decorate, { applyModalBackdropBlur } from './panels'
import { setScale } from './scale'
import { fetchIconLists } from './core/icons'
import { fetchFontLists, updateFont } from './core/fonts'
import { provideConfigToLess, provideIconStylesheets } from './core/configuration'
import { observeSettingsPanel } from './views/settings'
import { flatten, namespace, createFile } from './utils'
const

commands = {
  'reduced-dark-ui:decorate': () => decorate(),
  'reduced-dark-ui:reset-config': () => createFile('styles/definitions'),
  'reduced-dark-ui:update-stylesheets': () => provideConfigToLess(null, null, theme.settings),
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
    this.subscriptions = null
    this.settings = {}
    this.activate = this.activate.bind(this)
    this.deactivate = this.deactivate.bind(this)
    this.serialize = this.serialize.bind(this)
    this.listen = this.listen.bind(this)
    this.applyConfiguration = this.applyConfiguration.bind(this)
    this.bindSettings = this.bindSettings.bind(this)
  }

  activate (state) {
    // this.applySchema(configSchema)
    this.subscriptions = getComposite()

    let settings
    let schema = atom.config.getSchema('reduced-dark-ui')
    this.settings = settings = flatten(schema.properties)

    dev.log(settings, state, schema)

    // Add commands to the command palette & get configuration settings
    // let cmds    = atom.commands.add('atom-workspace', commands)
    let cmds = atom.commands.add('atom-workspace', commands)

    // Set up configuration change observers
    this.bindSettings()
    this.subscriptions.add(cmds)

    // Start the execution of the deferred tasks
    // (asynchronously in the background)
    try {
      for (let task in deferredTasks) {
        setImmediate(() => deferredTasks[task]()) }}

    catch (e) {
      dev.message('Activating reduced-dark-ui unsuccessful') }
  }

  serialize (...args) {
    dev.log(...args)
    return {}
  }

  deactivate () {
    this.subscriptions.dispose()
  }

  bindSettings () {
    for (let key in this.settings) {
      let callback
      let subscription
      let item = this.settings[key]
      let is = (n) => key === n
      if (!item.branch)
        continue

      if (is('uiScale') || is('spacing'))
        callback = setScale

      else if (key == 'uiFont')
        callback = updateFont

      else
        callback = provideConfigToLess

      item = {
        ...item,
        path: item.path.concat([key]),
        value: item.value || false }
      subscription = this.listen(item, callback)
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
    this.settings[key].value = value

    let attrs = [
      'uiScale',
      'spacing',
      'uiFont',
      'uiFontWeight']
    let shouldWriteToDom = attrs.indexOf(key) !== -1
    let ns = namespace(key)
    let config = this.settings
    if (shouldWriteToDom)
      document.documentElement.setAttribute(ns, value)
    callback({ value, key, config })
  }
}


const theme = new Theme('reduced-dark-ui')
export default theme
