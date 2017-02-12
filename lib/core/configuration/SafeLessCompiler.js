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
    if (!file || !file.path || !this.check(file).status)
      return { status: false, message: "Error parsing stylesheet" }

    let { path } = this.package
    let sourcePath = path + '/_index.less'
    let source = atom.themes.loadStylesheet(sourcePath)
    let params = { sourcePath, }
    let css = atom.styles.addStyleSheet(source, params)
    this.subscriptions.dispose()
    this.subscriptions.add(css)
    console.log(this.subscriptions)
  }

}
