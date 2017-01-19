'use babel'
import dev from './tools'
import { CompositeDisposable } from 'atom'
import { setScale } from './scale'
import { provideConfigToLess, provideIconStylesheets, resetConfigStylesheet, applyFonts } from './core/configuration'
import { observeSettingsPanel } from './views/settings'
import { fetchIconLists } from './core/icons'
import { fetchFontLists, getFontFaceDefinition } from './core/fonts'
import { showModal } from './components/IconPicker'
import getComposite from './core/subscribe'
import decorate, { applyModalBackdropBlur } from './panels'
import { pkg, flatten, doc, conf, namespace, createFile } from './utils'


class Theme {

  constructor (settings=[]) {
    this.settings = flatten(settings)
    this.onConfigUpdate = this.onConfigUpdate.bind(this)
    this.listen = this.listen.bind(this)
  }

  activate (state) {

    let existing = atom.config.get('reduced-dark-ui') || {}
    let subscriptions = []

    for (let key in this.settings) {
      let callback
      let subscription
      let item = this.settings[key]
      if (!item.branch)
        continue

      if (key == 'uiScale')
        callback = setScale

      else if (key == 'uiFont')
        callback = () =>

        getFontFaceDefinition(item.value)
          .then(response => {
            let pack = atom.packages.getLoadedPackage(rootNamespace)
            if(response.raw)
              applyFonts(pack, response.raw)

          })
          .catch(e => dev.message(e))

      else
        callback = (() => provideConfigToLess(this.settings))

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
    return this.settings
  }

  listen (item, callback) {
    let { value, type, path } = item
    let ns = namespace(path, true)
    return atom.config.observe(
      ns, val => {
        return this.onConfigUpdate(path, val || value, type, callback)
      })
  }

  onConfigUpdate (path, value, type, callback) {
    let key = path[path.length-1]
    let attrs = [
      'uiScale',
      'spacing',
      'uiFont',
      'uiFontWeight'
    ]
    let shouldWriteToDom = attrs.indexOf(key) !== -1
    let ns = namespace(key)

    if (shouldWriteToDom)
      doc.setAttribute(ns, value)

    this.settings[key].value = value
    console.log(key, "_", value);
    if (callback)
        callback()
  }
}


let theme,
    subscriptionManager,
    isLoaded = false

const commands = {
        'reduced-dark-ui:decorate': () => decorate(),
        'reduced-dark-ui:reset-config': () => createFile('styles/definitions'),
        'reduced-dark-ui:update-stylesheets': () => provideConfigToLess(theme.settings),
        'reduced-dark-ui:provide-icon-stylesheets': () => provideIconStylesheets(),
        'reduced-dark-ui:update-fonts-listing': () => atom.devMode ? fetchFontLists() : null },

      deferredTasks = [
        applyModalBackdropBlur,
        fetchIconLists,
        observeSettingsPanel ],



      activate = options => {

        const safeguard = () => {

          theme = new Theme(conf)
          subscriptionManager = getComposite()

          // Add commands to the command palette & get configuration settings
          let subs = theme.activate(options) || []
          let cmds = atom.commands.add('atom-workspace', commands)

          // Set up configuration change observers
          for (let sub of subs) {
            subscriptionManager.add(sub)}
            subscriptionManager.add(cmds)

          // Commands initial execution
          for (let cmd in commands) {
            setImmediate(() => commands[cmd]()) }

          // Deferred tasks, executed asynchronously in the background
          for (let task in deferredTasks) {
            setImmediate(() => deferredTasks[task]()) }
        }

        if (atom.devMode)
          try {
            safeguard() }
          catch (e) {
            dev.message('Activation was unsuccessful') }
        else
          safeguard()
      },


      deactivate = state => {
        if (atom.devMode)
          dev.log({state})
        subscriptionManager.dispose()
        theme.deactivate()
      },

      consumeAutoreload = (reloader) =>
        reloader({
          pkg: "reduced-dark-ui",
          files: ["package.json"],
          folders: ["lib/"]
        }),


      serialize = () => {
        let state = {

        }
        return state }


export {
  activate,
  deactivate,
  decorate,
  consumeAutoreload,
}
