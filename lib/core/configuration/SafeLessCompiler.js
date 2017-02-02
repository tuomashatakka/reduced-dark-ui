'use babel'


/**
 * @class SafeLessCompiler
 * @extends React.Component
 */
export default class SafeLessCompiler {

  constructor (props) {
    let { packageName } = props
    this.package = atom.packages.getLoadedPackage(packageName)
    this.compiled = false
  }


  compileDeferred (name='index') {
    let path = `${this.package.path}/_${name}.less`
    let source = atom.themes.loadStylesheet(path)
    let css = atom.themes.applyStylesheet(path, source)
    let dispense = css.disposalAction
    atom.packages.onDidDeactivatePackage(pack => {
      if(pack == this.package) {
        this.compiled = false
        css.dispose()
      }
    })
    this.compiled = true
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


  apply ({packageName, file}) {
    if (!this.check(file).status)
      return { status: false, message: "Error parsing stylesheet" }

    let { path } = this.package
    let sourcePath = path + '/_index.less'
    let source = atom.themes.loadStylesheet(sourcePath)
    let params = { sourcePath, }
    atom.styles.addStyleSheet(source, params)
  }

}
