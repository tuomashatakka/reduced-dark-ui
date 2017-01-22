'use babel'

import dev from '../tools'
import fs from 'fs'
import os from 'path'
import { rootNamespace } from '../utils'


const stylesheetHeader = () => `
// This is a dynamically generated stylesheet. Modifications to this file will be mercilessly overwritten by the ${rootNamespace} package.
// @repository: https://github.com/tuomashatakka/reduced-dark-ui/
`

// const generateRuleSet = (arr) => arr.map(o => generateRulesFor(o)).join('\n')
const stylesheetPath = os.resolve(os.join(__dirname, '..', '..', 'styles', 'definitions'))

const generateLessVariableSet = (arr) =>
  arr.map(rules => generateRulesFor({rules, indent: "@config-"})).join('\n')

const generateRulesFor = ({rules, indent, classNames}) => {
  let buffer = Object.keys(rules).reduce(
    (result, attr) =>
     result += generateRule(attr, rules[attr], indent), "")

  if (!classNames)
    return buffer

  let selector = classNames.reduce(
    (result, className) => result += (result ? ', ' : '\n') + ('.' + className), "")

  return `
    ${selector} {
      ${buffer} }`
}


const generateRule = (attr, val, indent=1) => {
  if (attr === 'icons')
    return "\n"

  if (!isNaN(parseInt(indent)))
    Array(parseInt(indent)).fill('\t')

  val = (val ? val.toJSON ? val.toJSON() : val : false)
    .toString()
    .trim()
    .toLowerCase()

  if (val.endsWith(';'))
    val = val.substr(0, val.length - 1)

  return `\n${indent}${attr}: ${val};`
}


const iconPaths = ({path}) => [
  path + '/assets/iconsets/ionicons/ionicons.less',
  path + '/assets/iconsets/icomoon/icomoon.css',
  // path + '/assets/iconsets/mdi/materialdesignicons.css',
]

const provideIconStylesheets = () => {

  let pack = atom.packages.getLoadedPackage('reduced-dark-ui')
  let { styleManager } = pack
  if (!styleManager) {
    // TODO
    styleManager = atom.styles
    return
  }

  for (let sourcePath of iconPaths(pack)) {
    let source = atom.themes.loadLessStylesheet(sourcePath)
    let disposable = styleManager.addStyleSheet(source, { sourcePath, })
    pack.onDidDeactivate(() => disposable.dispose())
  }
}

const applyStylesheet = (pack, output, file='config') => {
  let { stylesheets } = pack
  let contents = stylesheetHeader() + output

  dev.log({file, stylesheetPath, contents})
  fs.writeFile(
    os.join(stylesheetPath, file + '.less'),
    contents,
    'utf8',
    () => {

      stylesheets.forEach(
      stylesheet => {
        let sourcePath = stylesheet[0]

        try {
          let source = atom.themes.loadLessStylesheet(sourcePath)
          let params = { sourcePath, }
          let disposable = atom.styles.addStyleSheet( source, params )
          dev.log(sourcePath, disposable)
          pack.onDidDeactivate(() => disposable.dispose())
        }

        catch(e) {
          dev.error("Error at reading the stylesheet in", sourcePath)
        }
        finally {
          if (atom.devMode)
          atom.notifications.addSuccess('Reloaded stylesheets!')
        }

    })})
}

const applyConfig = (...args) => applyStylesheet(...args, 'config')
const applyFonts = (...args) => applyStylesheet(...args, 'font')


const provideConfigToLess = ({config}) => {

  let values = {}
  let pack = atom.packages.getLoadedPackage(rootNamespace)

  if (!pack)
    return

  for (let attr in config) {
    if (config[attr].branch)
      values[attr] = config[attr].value
  }
  let output =
    generateLessVariableSet([values])
  setImmediate(() =>
    applyConfig(pack, output))
}


const resetConfigStylesheet = () =>
  fs.writeFile(
    stylesheetPath,
    stylesheetHeader(),
    'utf8',
    () => {})


export default
  provideConfigToLess

export {
  provideConfigToLess,
  provideIconStylesheets,
  resetConfigStylesheet,
  stylesheetPath,
  applyFonts,
}
