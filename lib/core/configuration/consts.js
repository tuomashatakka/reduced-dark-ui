'use babel'
import { rootNamespace } from '../../utils'
import { throttle } from 'underscore'

const stylesheetHeader = () => `
// This is a dynamically generated stylesheet. Modifications to this file will be mercilessly overwritten by the ${rootNamespace} package.
// @repository: https://github.com/tuomashatakka/reduced-dark-ui/
`
const mainLessImportClause =
  (base) => `\n@import "${base}/index.less";`

const generateLessVariableSet = (arr) =>
  arr.map(rules => generateRulesFor({rules, indent: "@__"})).join('\n')

const generateRulesFor = ({rules, indent, classNames}) => {
  let buffer = Object.keys(rules).reduce(
    (result, attr) => {
      let repr = generateRule(attr, rules[attr], indent)
      return result += typeof repr !== 'undefined' ? repr : ''
    }, "")
  if (!classNames) return buffer
  let selector = classNames.reduce( (result, className) => result += (result ? ', ' : '\n') + ('.' + className), "")
  return `
    ${selector} {
      ${buffer} }`}

const generateRule = (attr, val, indent=1) => {

  if (attr === 'icons' || attr.endsWith('_KEY'))
    return "//"

  let isNum = !isNaN(parseInt(val)) && typeof val === 'number'
  let isBool = val === true || val === false || val === "true" || val === "false"
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

const provideConfigToLess = ({config}) => {
  // TODO: Deprecate this function id:13
  let pack = atom.packages.getLoadedPackage(rootNamespace)
  let values = {}
  for (let attr in config) {
    if (config[attr].branch)
      values[attr] = config[attr].value}
  return (
    stylesheetHeader() +
    generateLessVariableSet([values])
  )
}


export {
  provideConfigToLess,
  provideIconStylesheets }
