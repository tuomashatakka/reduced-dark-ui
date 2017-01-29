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
    // let path = file.getRealPathSync()
    // let errs = []
    let sourcePath = path + '/_index.less'
    let source = atom.themes.loadStylesheet(sourcePath)
    let params = { sourcePath, }
    atom.styles.addStyleSheet(source, params)
    // let disposable = atom.themes.applyStylesheet( sourcePath, source )
    // this.package.onDidDeactivate(() =>
    //   disposable.dispose())
    //
    // try {
    //   console.log(pack, path);
    //   let { stylesheets } = pack
    //
    //   // let sub = atom.themes.applyStylesheet( path, raw )
    //   // console.log(raw);
    //   // let raw = atom.themes.loadLessStylesheet(path)
    //
    //   stylesheets.forEach(
    //     stylesheet => {
    //       let disposable, source, _source
    //       let sourcePath = stylesheet[0]
    //       let sourceConfPath='/users/tuomas/.atom/storage/reduced-dark-ui/config.less'
    //       let params = { sourcePath, }
    //
    //       try {
    //         _source = atom.themes.requireStylesheet(sourcePath)
    //         _confsource = atom.themes.loadLessStylesheet(sourceConfPath)
    //         disposable = atom.styles.addStyleSheet( _source, params )
    //         disposable = atom.styles.addStyleSheet( _confsource, {sourcePath: sourceConfPath} )
    //         source = atom.themes.loadLessStylesheet(sourcePath)
    //       }
    //       catch (e) {
    //         errs.push({ sourcePath, message: e })
    //       }
    //       finally {
    //         console.log("_sourcepreview")
    //         console.log(_source)
    //         console.log("APPLYIN YO STYLEZZ HOMIE BRAHH", sourcePath, this, params);
    //         try {
    //           disposable = atom.styles.addStyleSheet( _source, params )
    //         }
    //         catch (e) {
    //           errs.push({ sourcePath, message: e})
    //         }
    //       }
    //
    //     // pack.onDidDeactivate(() =>
    //     //   disposable.dispose())
    //   })
    //
    //   for (let err in errs) {
    //     atom.notifications.addWarning(err.message, {details: err.sourcePath, dispose: true})
    //   }
    //   // pack.onDidDeactivate(sub.dispose())
    //   return { message: "Successfully activated",
    //          //subscriptions: [sub],
    //            status: true }}
    //
    // catch (err) {
    //   return {
    //     response: false,
    //     message: err }}
  }

}
