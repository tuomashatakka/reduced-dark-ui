'use babel'
import { Emitter, CompositeDisposable, File, Directory } from 'atom'
import SafeLessCompiler from './SafeLessCompiler'
import os from 'path'
import { writeFileSync, readFileSync, mkdirSync, statSync } from 'fs'

export const OPERATION = {
  ON_CHANGE: 'on-did-rewrite-mutate',
  ON_LOAD: 'on-load',
  ON_SHUTDOWN: 'on-shutdown',
  ON_DID_BEGIN: 'on-did-rewrite-start',
  ON_DID_END: 'on-did-rewrite-end',
  ON_STACK_EMPTIED: 'on-did-finish',
  REQUEST_REWRITE: 'on-did-rewrite-requested'
}

const DEFAULTS = {
  dirName: null,//'theme',
  packageName: 'reduced-dark-ui',
}

const baseDirForSpecs = os.resolve(__dirname + '/../../..')

/**
 * @class ConfigManager
 * @extends Emitter
 */
export default class ConfigManager extends Emitter {

  constructor (args) {
    super(args)

    let store = atom.getStorageFolder()
    let { dirName, packageName } = /*args ||*/ DEFAULTS
    if (!dirName) dirName = packageName
    let storagePath = !atom.inSpecMode() ? store.pathForKey(dirName) : baseDirForSpecs
    this.queue = []
    this.transaction = false
    this.transactionCount = 0
    this.storage = new Directory(storagePath)
    this.compiler = new SafeLessCompiler({ packageName })
    this.subscriptions = new CompositeDisposable()
    this.configured = !atom.inSpecMode() ? localStorage.getItem('reduced-dark-activated') === "1" : false

    // Shorthands
    this.updateFont = (content) => this.requestConfigurationRewrite({ name: 'font',   content })
    this.updateConf = (content, compile) => {
      if (compile)
        content = this.compiler.translateToLessVariables(content)
      return this.requestConfigurationRewrite({ name: 'config', content })
    }

    // Event listeners
    let mutationEvent = this.on(OPERATION.ON_CHANGE, payload => {
      this.transaction = payload ? true : false
      if(this.transaction) this.emit(OPERATION.ON_DID_BEGIN, payload)
      else this.emit(OPERATION.ON_DID_END, payload) })
    let startEvent  = this.on(OPERATION.ON_DID_BEGIN, data => this.writeConfigurationToFile(data))
    let endEvent    = this.on(OPERATION.ON_DID_END, data => this.processQueue(data))
    let finishEvent = this.on(OPERATION.ON_STACK_EMPTIED, () => {
      if (atom.inSpecMode()) {
        this.compiler.apply(new File(baseDirForSpecs + '/__index.less'))
      } else {
      let entries   = this.storage.getEntriesSync()
      for (let file of entries) {
        this.compiler.apply({file}) }}})

    this.subscriptions.add(mutationEvent)
    this.subscriptions.add(startEvent)
    this.subscriptions.add(endEvent)
    this.subscriptions.add(finishEvent)
    this.emit(OPERATION.ON_LOAD)
  }

  /* Public  - use only this to rewrite config */
  requestConfigurationRewrite ({ content, name }) {
    this.emit(OPERATION.REQUEST_REWRITE)

    let path = this.storage.getRealPathSync()
    let payload = { path, name, content }
    this.processQueue(payload)
  }

  getFile ({ name }) {

    let type = 'less'
    let file = new File()
    let dir = this.storage.getRealPathSync()
    name = `${name}.${type}`

    let path = os.join(dir, name)
    file.setPath(path)
    const exists = file.existsSync()

    return new Promise((resolve, reject) => {
      const accept = () => resolve({ status: true, file, path })
      const error = message => reject({ status: false, message })

      if (exists)
        accept()

      else file
          .create()
          .then(() => accept())
          .catch(message => error(message))
    })
  }

  getDirectory () {

    return new Promise((resolve, reject) => {

      const path = this.storage.getRealPathSync()
      const accept = () => resolve({ status: true, path })
      const error = (message) => reject({ status: false, message, path })

      const create = () => this.storage.create()
        .then(() => accept())
        .catch(error)

      const exec = () => this.storage.exists()
        .then(res => res ? accept(res) : create())
        .catch(error)

      exec()
    })
  }

  writeConfigurationToFile ({ content, path, name }) {
    try {
      if (path) {
        name = `${name}.less`
        path = os.join(path, name)
        writeFileSync(path, content)
      }
      this.transactionCount ++
      this.emit(OPERATION.ON_CHANGE)
    }
    catch (e) {
      this.configured = false

      if (this.initStorage()) {
        this.transactionCount ++
        this.emit(OPERATION.ON_CHANGE)
      }
      else if (atom.devMode) {
        console.warn(
          "Could not write the config file", e)
        atom.notifications.addWarning(
          "Could not write the config file. Error dump: " + JSON.stringify(e),
          { dismissable: true })
      }
    }
  }

  processQueue (payload) {

    let next = null
    if (payload) {

      this.queue = this.queue
      .filter(o => o.name !== payload.name)
      .concat([payload])
    }

    if (this.transaction)
      return
    if (this.queue.length) {
      next = this.queue.splice(0, 1)
      this.emit(OPERATION.ON_CHANGE, ...next) }
    else
      this.emit(OPERATION.ON_STACK_EMPTIED)
  }

  destroy () {
    this.subscriptions.dispose()
    this.emit(OPERATION.ON_SHUTDOWN)
  }

  /**
   * @method initStorage
   *
   * This function is for generating the initial dependencies for the theme
   * to be less-compilable;
   *   - generates a directory named `reduced-dark-ui` into the atom's storage dir
   *     - writes two empty files into that dir; `config.less` file for less variables and;
   *     - `font.less` file for the font-face definitions
   *   - injects the import statement to said files into the ui-variables file
   *
   * The theme loads an empty less file with the theme by default so the less compiler
   * won't break even if this function was to be run after the inclusion of the theme's
   * main stylesheet.
   */
  initStorage () {

    if (this.configured)
      return true

    let pkg = this.package
    let stylesPath

    if (atom.devMode)
      console.log(pkg)
    if (!pkg || !pkg.path) {
      pkg = atom.packages.getLoadedPackage('reduced-dark-ui')
      stylesPath = os.join(__dirname, '..', '..', '..', 'styles')
      if (atom.devMode)
        console.log(pkg.path)
    }
    else
      stylesPath          = os.join(pkg.path, 'styles')

    // let store               = atom.getStorageFolder()
    // let configPath          = store.pathForKey(pkg.name)
    let configPath          = this.storage.getRealPathSync()
    if (atom.inSpecMode())
        configPath          = baseDirForSpecs
    let configFilePath      = os.join(configPath, 'config.less')
    let fontConfigFilePath  = os.join(configPath, 'font.less')
    let variablesFilePath   = os.join(stylesPath, 'ui-variables.less')
    let importFallbackVars  = "@import '_styles/config-fallback';\n"
    let importUIVars        = "@import '_styles/ui-variables';\n"
    let importUserVars      = `@import '${configFilePath}';\n`
    let importFontDefs      = `@import '${fontConfigFilePath}';\n`

    // Write config storage file if it doesn't exist
    let configContents, fontConfigContents
    try      { statSync(configPath)}
    catch(e) { mkdirSync(configPath)}

    try      {
      configContents = readFileSync(configFilePath, 'utf8')
      fontConfigContents = readFileSync(fontConfigFilePath, 'utf8')}
    catch(e) {
      writeFileSync(configFilePath, " ")
      writeFileSync(fontConfigFilePath, " ")}

    // Inject the import statements if it has not been done before
    try {
      let contents = readFileSync(variablesFilePath, 'utf8')
      let importCount = 0
      contents.replace(/\@import/g, () => importCount++)
      if (importCount < 4)
        writeFileSync(variablesFilePath,
        `${importFontDefs}${importFallbackVars}${importUserVars}${importUIVars}`)
      localStorage.setItem('reduced-dark-activated', "1")
      return true }

    // If there was an error
    catch(e) {
      writeFileSync(variablesFilePath, `${importFallbackVars}${importUIVars}`)
      return false }
  }
}
