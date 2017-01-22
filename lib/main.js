'use babel'

import dev from './tools'
import getComposite from './core/subscribe'
import decorate, { applyModalBackdropBlur } from './panels'
import { setScale } from './scale'
import { fetchIconLists } from './core/icons'
import { fetchFontLists, updateFont } from './core/fonts'
import { provideConfigToLess, provideIconStylesheets } from './core/configuration'
import { observeSettingsPanel } from './views/settings'
import { flatten, conf, namespace, createFile } from './utils'
import { throttle, debounce } from 'underscore'

let theme
let subscriptionManager
class Theme {

  constructor (options=[]) {
    this.name = 'reduced-dark-ui'
    this.readSettings()
    this.applyConfiguration = this.applyConfiguration.bind(this)
    this.listen = this.listen.bind(this)
    console.log(this)
  }

  readSettings() {
    this.schema = this.schema || atom.config.getSchema(this.name) || {}
    this.settings = flatten(this.schema.properties)
    console.log("settings read\n", this)
  }

  activate (state) {

    let subscriptions = []

    this.readSettings()
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
      subscriptions.push(subscription)
    }

    return subscriptions
  }

  deactivate () {
    subscriptionManager.dispose()
    return this.settings
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
    console.log(shouldWriteToDom, ns, value, key, config)
    if (shouldWriteToDom)
      document.documentElement.setAttribute(ns, value)
    callback({ value, key, config })
  }
}

const commands = {
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
        fetchFontLists ],

      activate = options => {

        const safeguard = () => {

          theme       = new Theme()
          subscriptionManager = getComposite()

          // Add commands to the command palette & get configuration settings
          // let cmds    = atom.commands.add('atom-workspace', commands)
          let cmds = atom.commands.add('atom-workspace', commands)
          let subs = theme.activate(options) || []

          // Set up configuration change observers
          for (let sub of subs) {
            subscriptionManager.add(sub)}
            subscriptionManager.add(cmds)

          // Start the execution of the deferred tasks
          // (asynchronously in the background)
          for (let task in deferredTasks) {
            setImmediate(() => deferredTasks[task]()) }}

        if (atom.devMode) try {
          safeguard() }
        catch (e) {
          dev.message('Activating reduced-dark-ui unsuccessful') }
        else
          safeguard()
      },


      deactivate = state => theme && theme.deactivate(state),


      serialize = () => {
        let state = {

        }
        return state }


export {
  activate,
  deactivate,
  serialize,
  decorate,
}
