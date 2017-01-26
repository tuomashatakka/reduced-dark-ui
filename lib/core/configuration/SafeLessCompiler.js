'use babel'


/**
 * @class SafeLessCompiler
 * @extends React.Component
 */
export default class SafeLessCompiler {

  constructor (props) {
    let { packageName } = props
    this.package = atom.packages.getLoadedPackage(packageName)
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

    let pack = this.package
    let path = file.getRealPathSync()
    let errs = []

    try {
      console.log(pack, path);
      let { stylesheets } = pack

      // let sub = atom.themes.applyStylesheet( path, raw )
      // console.log(raw);
      // let raw = atom.themes.loadLessStylesheet(path)

      stylesheets.forEach(
        stylesheet => {
          let disposable, source, _source
          let sourcePath = stylesheet[0]
          let sourceConfPath='/users/tuomas/.atom/storage/reduced-dark-ui/config.less'
          let params = { sourcePath, }

          try {
            _source = atom.themes.requireStylesheet(sourcePath)
            _confsource = atom.themes.loadLessStylesheet(sourceConfPath)
            disposable = atom.styles.addStyleSheet( _source, params )
            disposable = atom.styles.addStyleSheet( _confsource, {sourcePath: sourceConfPath} )
            source = atom.themes.loadLessStylesheet(sourcePath)
          }
          catch (e) {
            errs.push({ sourcePath, message: e })
          }
          finally {
            console.log("_sourcepreview")
            console.log(_source)
            console.log("APPLYIN YO STYLEZZ HOMIE BRAHH", sourcePath, this, params);
            try {
              disposable = atom.styles.addStyleSheet( _source, params )
            }
            catch (e) {
              errs.push({ sourcePath, message: e})
            }
          }

        // pack.onDidDeactivate(() =>
        //   disposable.dispose())
      })

      for (let err in errs) {
        atom.notifications.addWarning(err.message, {details: err.sourcePath, dispose: true})
      }
      // pack.onDidDeactivate(sub.dispose())
      return { message: "Successfully activated",
             //subscriptions: [sub],
               status: true }}

    catch (err) {
      return {
        response: false,
        message: err }}
  }

}
