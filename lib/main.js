'use babel'

import getComposite from './core/subscribe'
import panels from './core/panels'
import decorate, { applyModalBackdropBlur } from './panels'
import { flatten, namespace } from './utils'
import { setScale } from './scale'
import { applyConfig, applyFont, appendDependencyToVariablesStyle } from './core/configuration'
import observeThemeView from './views/SettingsView/register'

const
      PACKAGE_NAME = 'reduced-dark-ui',
      commands = {
        'reduced-dark-ui:decorate':           () => decorate(),
        'reduced-dark-ui:update-stylesheets': () => applyConfig({ config: theme.settings }),
        // 'reduced-dark-ui:update-fonts-listing': () => atom.devMode ? fetchFontLists() : null
      },
      // loadingElement = document.createElement('div'),
      curtainify = (hide=false) => {
        if (atom.inSpecMode())
          return

        let trans = hide === true ? 'none' : "opacity .5s, blur .29s"
        let body = document.body.children[0]
        body.style.opacity = hide === true ? 0 : 1
        body.style.webkitFilter = hide === true ? "blur(4px)" : "blur(0px)"
        body.style.transition = trans

        if (!hide) {
          body.style.animationPlayState = "running";
          body.style.webkitAnimationPlayState = "running"
          // loadingElement.classList.add('hidden')
        }
        // else
        //   loadingElement.classList.remove('hidden')
      },

      deferredTasks = [
        applyModalBackdropBlur,
        observeThemeView,
        curtainify,
      ]

curtainify(true)
// document.body.appendChild(loadingElement)
// if (!loadingElement.classList.contains('activating')) {
//
//   let contents = localStorage.getItem('reduced-dark-spinner')
//   let setContents = (html) => {
//     loadingElement.innerHTML = html
//     loadingElement.classList.add('activating')
//   }
//
//   if (contents)
//     setContents(contents)
//
//   else
//     require('fs')
//      .readFile(
//       require("path")
//      .resolve(__dirname + '/components/activation_animation.html'),
//      (err, html) => {
//         if (err) return
//         setContents(html)
//         localStorage.setItem('reduced-dark-spinner', html)
//     })
// }

class Theme {

  constructor () {

    let schema = atom.config.getSchema(PACKAGE_NAME)
    this.name = PACKAGE_NAME
    this.settings = {}
    this.subscriptions = null
    this.panels = panels()
    console.info("PanelManager", this.panels)
    console.info("Theme instance", this)
    appendDependencyToVariablesStyle(this.name)

    this.activate = this.activate.bind(this)
    this.deactivate = this.deactivate.bind(this)
    this.serialize = this.serialize.bind(this)
    this.listen = this.listen.bind(this)
    this.applyConfiguration = this.applyConfiguration.bind(this)
    this.bindSettings = this.bindSettings.bind(this)
    this.subscriptions = getComposite()
    this.settings = flatten(schema.properties)

    // atom.packages.onDidActivateInitialPackages(
    //   ()=>{
    //     console.log('added handler for initial packages activation hook')
    //   curtainify()
    //   atom.packages.onDidActivatePackage(() => curtainify())})
    // //this.configManager = new Manager({ packageName: this.name })
    setTimeout(() => curtainify(), 800)
  }


  activate () {

    // Add commands to the command palette & get configuration settings
    let cmds = atom.commands.add('atom-workspace', commands)
    setImmediate(() => this.subscriptions.add(cmds))

    // Set up configuration change observers
    setImmediate(() => this.bindSettings())

    // Start the execution of the deferred tasks
    this.runBackgroundTasks()
    setImmediate(() => curtainify())
  }

  runBackgroundTasks () {
    for (let task in deferredTasks) {
      setImmediate(() => deferredTasks[task]())
    }
  }


  serialize () {
    return {}
  }


  deactivate () {
    this.subscriptions.dispose()
    localStorage.setItem('reduced-dark-activated', null)
    localStorage.setItem('reduced-dark-spinner', null)
  }


  provideIconFonts (service) {
    console.warn("ICON FONTS HURRAY")
    console.warn("-> service", service)
  }


  bindSettings () {

    // TODO: Move to the ConfigManager class! id:15
    for (let key in this.settings) {
      let callback,
          item = this.settings[key],
          is = (n) => key === n
      if (!item.branch)                   continue
      if (is('uiScale') || is('spacing')) callback = setScale
      else                                callback = applyConfig

      let path          = item.path.concat([key])
      let value         = item.value || false
      let subscription  = this.listen({ ...item, path, value }, callback)
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
    let attrs = [ 'uiScale', 'spacing' ]
    let shouldWriteToDom = attrs.indexOf(key) !== -1

    this.settings[key].value = value
    let config = this.settings

    if (shouldWriteToDom)
      document.documentElement.setAttribute(key, value)
    if (callback)
      callback({ value, key, config })
  }
}

var theme = window.theme = new Theme(PACKAGE_NAME)
const _theme = () => window.theme = theme = theme ? theme : new Theme(PACKAGE_NAME)
export default {

  activate: (...args) =>
    _theme().activate(...args),

  deactivate: (...args) =>
    _theme().deactivate(...args),

  provideIconFonts: (service) =>
    _theme().provideIconFonts(service),
}
