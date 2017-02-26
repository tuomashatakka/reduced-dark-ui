'use babel'
import { writeFile, writeFileSync, statSync, mkdirSync, readFileSync }  from 'fs'
import { resolve }    from 'path'
import { Emitter, Directory, CompositeDisposable }    from 'atom'
import { PACKAGE_NAME } from '../../constants'


export default class ConfigManagerAnew extends Emitter {

  constructor () {
    super()
    let pack              = atom.packages.getLoadedPackage(PACKAGE_NAME)
    let store             = atom.getStorageFolder()
    let storagePath       = store.pathForKey(PACKAGE_NAME)
    this.storage          = new Directory(storagePath)
    this.transactionState = {}
    this.path             = this.storage.getRealPathSync()
    this.packagePath      = pack.path
    this.updateIconfont   = (name, content) => this.requestConfigurationRewrite({ name: 'font-' + name, content })
    this.updateFont       = (content) => this.requestConfigurationRewrite({ name: 'font', content })
    this.updateConf       = (content) => this.requestConfigurationRewrite({ name: 'config', content: translateToLessVariables(content) })
    this.reset()
  }

  /* Public  - use only this to rewrite config */
  requestConfigurationRewrite ({ content, name }) {
    let path      = resolve(`${this.path}/${name}.less`)
    let payload   = { name, content, path }

    this.compiled = false
    if (this.transactionState[name])
      this.queue[name] = payload

    else {
      this.transactionState[name] = true
      this.writeConfigurationToFile(payload)
    }
  }

  didFinishTransaction (name) {
    let next = {...this.queue[name]}

    if (next && next.content) {
      this.writeConfigurationToFile(next)
      this.queue[name] = null
    }

    else {

      let path   = `${this.packagePath}/_index.less`
      let source = atom.themes.loadStylesheet(path)
      let css    = atom.themes.applyStylesheet(path, source)
      let params = {
        sourcePath: path,
        priority: 2,
      }
      atom.styles.addStyleSheet(source, params)
      this.apply(css)
      // this.dispose()
      this.transactionState[name] = false
    }
  }

  dispose () {

    if (this.subscriptions)
      this.subscriptions.dispose()

    this.compiled      = false
    this.subscriptions = new CompositeDisposable()
  }

  apply (css) {
    this.subscriptions.add(css)
    this.compiled = true
  }

  reset () {
    this.queue = {}
    this.dispose()
  }


  writeConfigurationToFile ({ name, content, path }) {
    setImmediate(() => writeFile(path, content, 'utf8',
      () => this.didFinishTransaction(name, content)) )
  }

  initStorage () {
    this.init = initStorage()
  }


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

let formatted = () => localStorage.getItem('reduced-dark-activated') === '1'

function initStorage () {

  let pkg                 = atom.packages.getLoadedPackage(PACKAGE_NAME)
  let store               = atom.getStorageFolder()

  let stylesPath          = resolve(`${pkg.path}/styles`)
  let configPath          = store.pathForKey(pkg.name)
  let configFilePath      = resolve(`${configPath}/config.less`)
  let fontConfigFilePath  = resolve(`${configPath}/font.less`)
  let variablesFilePath   = resolve(`${stylesPath}/ui-variables.less`)

  let importFallbackVars  = "@import '_styles/config-fallback';\n"
  let importUIVars        = "@import '_styles/ui-variables';\n"
  let importUserVars      = `@import '${configFilePath}';\n`
  let importFontDefs      = `@import '${fontConfigFilePath}';\n`

  return new Promise((resolve, reject) => {


    // Write config storage file if it doesn't exist
    try      {
      statSync(configPath)  }

    catch(e) {
      mkdirSync(configPath) }

    try      {
      readFileSync(configFilePath, 'utf8')
      readFileSync(fontConfigFilePath, 'utf8')
    }
    catch(e) {
      writeFileSync(configFilePath, " ")
      writeFileSync(fontConfigFilePath, " ")
      // reject({message: e, state: false})
    }

    // Inject the import statements if it has not been done before
    let contents
    try {
      contents = readFileSync(variablesFilePath, 'utf8')
    }
    // If there was an error
    catch(e) {
      writeFile(variablesFilePath, `${importFallbackVars}${importUIVars}`, 'utf8', (err) => {
        localStorage.setItem('reduced-dark-activated', null)
        resolve({message: err, state: false})
      })
    }
    let importCount = 0
    contents.replace(/\@import/g, () => importCount++)
    if (importCount < 4)
      writeFile(variablesFilePath,
        `${importFontDefs}${importFallbackVars}${importUserVars}${importUIVars}`,
        'utf8',
        () => {
          localStorage.setItem('reduced-dark-activated', "1")
          resolve({state: true})
        })
  })
}


function translateToLessVariables ({ config }) {

  let stream = ''
  for (let attr in config) {

    let item = config[attr]
    let { type, value, branch } = item

    // Skip the cases where the variable has no value
    if (!branch ||
        value == 'undefined' ||
        typeof value === 'undefined')
        continue

    // Prepend the variable names with two underscores
    attr = `__${attr}`

    // Add hyphens to string variables
    if (type === 'string')
      stream += `@${attr}: "${value}";\n`

    // Echo hex codes for Color objects
    else if (type === 'color')
      stream += `@${attr}: ${value.toJSON()};\n`

    // Pass integers and booleans as-is
    else if (type === 'integer' ||
      type === 'boolean')
      stream += `@${attr}: ${value};\n`
  }

  return stream
}
