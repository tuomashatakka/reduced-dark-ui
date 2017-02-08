'use babel'
import fs from 'fs'
import os from 'path'
import { CompositeDisposable } from 'atom'


/**
 * @class SafeLessCompiler
 * @extends React.Component
 */
export default class SafeLessCompiler {

  constructor (props) {
    let { packageName }   = props
    this.package          = atom.packages.getLoadedPackage(packageName)
    this.sourceFilesExist = atom.inSpecMode()
    this.compiled         = false
    this.subscriptions    = new CompositeDisposable()
    this.package.onDidDeactivate(() => {
      this.compiled = false
      this.subscriptions.dispose()
    })
  }


  compileDeferred (name='index') {
    let path = `${this.package.path}/_${name}.less`
    let source = atom.themes.loadStylesheet(path)
    let css = atom.themes.applyStylesheet(path, source)
    this.subscriptions.add(css)
    this.compiled = true
  }


  translateToLessVariables ({ config }) {
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


  check (file) {
    let { path } = file || this.package

    try {
      atom.themes.lessCache.read(path)
      return { status: true } }

    catch (e) {
      return {
        status: false,
        error: e, } }
  }


  apply ({file, raw}) {
    if (raw)
      return
    else if (!this.check(file).status)
      return { status: false, message: "Error parsing stylesheet" }

    let { path } = this.package
    let sourcePath = path + '/_index.less'
    let source = atom.themes.loadStylesheet(sourcePath)
    let params = { sourcePath, }
    let css = atom.styles.addStyleSheet(source, params)
    this.subscriptions.add(css)
    console.log(this.subscriptions)
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

    if (localStorage.getItem('reduced-dark-activated'))
      return true

    let pkg                 = this.package
    let store               = atom.getStorageFolder()
    let stylesPath          = os.join(pkg.path, 'styles')
    let configPath          = store.pathForKey(pkg.name)
    let configFilePath      = os.join(configPath, 'config.less')
    let fontConfigFilePath  = os.join(configPath, 'font.less')
    let variablesFilePath   = os.join(stylesPath, 'ui-variables.less')
    let importFallbackVars  = "@import '_styles/config-fallback';\n"
    let importUIVars        = "@import '_styles/ui-variables';\n"
    let importUserVars      = `@import '${configFilePath}';\n`
    let importFontDefs      = `@import '${fontConfigFilePath}';\n`

    // Write config storage file if it doesn't exist
    let configContents, fontConfigContents
    try      { fs.statSync(configPath)}
    catch(e) { fs.mkdirSync(configPath)}

    try      {
      configContents = fs.readFileSync(configFilePath, 'utf8')
      fontConfigContents = fs.readFileSync(fontConfigFilePath, 'utf8')}
    catch(e) {
      fs.writeFileSync(configFilePath, " ")
      fs.writeFileSync(fontConfigFilePath, " ")}

    // Inject the import statements if it has not been done before
    try {
      let contents = fs.readFileSync(variablesFilePath, 'utf8')

      if (atom.inSpecMode()) {
        this.apply()
        return
      }
      let importCount = 0
      contents.replace(/\@import/g, () => importCount++)
      if (importCount < 4)
        fs.writeFileSync(variablesFilePath,
        `${importFontDefs}${importFallbackVars}${importUserVars}${importUIVars}`)
      localStorage.setItem('reduced-dark-activated', true)
      return true }

    // If there was an error
    catch(e) {
      fs.writeFileSync(variablesFilePath, `${importFallbackVars}${importUIVars}`)
      return false }
  }

}
