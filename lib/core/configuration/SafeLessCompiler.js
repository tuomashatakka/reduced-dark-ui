'use babel'


/**
 * @class SafeLessCompiler
 * @extends React.Component
 */
export default class SafeLessCompiler {

  constructor (props) {
    let { packageName } = props
    this.packacge = atom.packages.getActivePackage(packageName)
  }


  check (file) {
    let { path } = file || this.packacge

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

    let pack = atom.packages.getActivePackage(packageName)
    let path = file.getRealPathSync()

    try {
      let raw = atom.themes.loadLessStylesheet(path)
      let sub = atom.themes.applyStylesheet( path, raw )

      pack.onDidDeactivate(sub.dispose())
      return { message: "Successfully activated",
               subscriptions: [sub],
               status: true }}

    catch (err) {
      return {
        response: false,
        message: err }}
  }

}
