'use babel'
import { rootNamespace } from '../../utils'
import { throttle } from 'underscore'
const stylesheetHeader = () => `
// This is a dynamically generated stylesheet. Modifications to this file will be mercilessly overwritten by the ${rootNamespace} package.
// @repository: https://github.com/tuomashatakka/reduced-dark-ui/
`
const mainLessImportClause =
  (base) => `\n@import "${base}/index.less";`
// const generateRuleSet = (arr) => arr.map(o => generateRulesFor(o)).join('\n')
const generateLessVariableSet = (arr) =>
  arr.map(rules => generateRulesFor({rules, indent: "@config-"})).join('\n')
const generateRulesFor = ({rules, indent, classNames}) => {
  let buffer = Object.keys(rules).reduce(
    (result, attr) => result += generateRule(attr, rules[attr], indent), "")
  if (!classNames) return buffer
  let selector = classNames.reduce( (result, className) => result += (result ? ', ' : '\n') + ('.' + className), "")
  return `
    ${selector} {
      ${buffer} }`}
const generateRule = (attr, val, indent=1) => {
  if (attr === 'icons' || attr.endsWith('_KEY'))
    return "//o"
  let isNum = !isNaN(parseInt(val)) && typeof val === 'number'
  let isBool = val === true || val === false
  let isColor = val && (val.constructor.name == 'Color' || val[0] === '#')
  if (!isNaN(parseInt(indent)))
    indent = Array(parseInt(indent)).fill('\t').join("")
  val = (val ? val.toJSON ? val.toJSON() : val : false)
    .toString()
    .replace(/(\s+)/g, ' ')
    .trim()
    .toLowerCase()
  if (val.endsWith(';')) val = val.substr(0, val.length - 1)
  if (isNum) val = parseFloat(val)
  else if (!isBool && !isColor) val = `"${val}"`
  if (isNum || val.length > 0) return `\n${indent}${attr}: ${val};`
  return `\n//Error in writing config attribute ${attr}'s value [${val}]` }
const iconPaths = ({path}) => [
  path + '/assets/iconsets/ionicons/ionicons.less',
  path + '/assets/iconsets/icomoon/icomoon.css', ]
  // path + '/assets/iconsets/mdi/materialdesignicons.css',
const provideIconStylesheets = () => {
  let pack = atom.packages.getLoadedPackage('reduced-dark-ui')
  let { styleManager } = pack
  if (!styleManager) {
    styleManager = atom.styles
    return }
  for (let sourcePath of iconPaths(pack)) {
    let source = atom.themes.loadLessStylesheet(sourcePath)
    let disposable = styleManager.addStyleSheet(source, { sourcePath, })
    pack.onDidDeactivate(() => disposable.dispose())}}
// const applyStylesheet = (pack, output, file='config') => {
  // fs.writeFile(
  //   os.join(stylesheetPath, file + '.less'),
  //   contents,
  //   'utf8',
  //   () => {
  //
  //     stylesheets.forEach(
  //     stylesheet => {
  //       let sourcePath = stylesheet[0]
  //
  //       try {
  //         let source = atom.themes.loadLessStylesheet(sourcePath)
  //         let params = { sourcePath, }
  //         let disposable = atom.styles.addStyleSheet( source, params )
  //         pack.onDidDeactivate(() => disposable.dispose())
  //       }
  //
  //       catch(e) {
  //         dev.error("Error at reading the stylesheet in", sourcePath)
  //       }
  //
  //   })})
// }
//
const extractFontRaw = (c) =>  {
  let content = c.raw
  setImmediate(() => manager.requestConfigurationRewrite({ content, name: 'font' }))}
const formatConfig = throttle(generateLessVariableSet, 1000)
const applyFonts = throttle(extractFontRaw, 1000)
const provideConfigToLess = ({manager, config}) => {
  // TODO: Deprecate this function
  let name = 'config'
  let pack = atom.packages.getLoadedPackage(rootNamespace)
  let values = {}
  if (!pack) return
  for (let attr in config) {
    if (config[attr].branch)
      values[attr] = config[attr].value}
  let content =
    stylesheetHeader() +
    mainLessImportClause(pack.path) +
    formatConfig([values])
  setImmediate(() => manager.requestConfigurationRewrite({ content, name }))}
export default provideConfigToLess
export {
  provideConfigToLess,
  provideIconStylesheets,
  applyFonts, }