'use babel'

import fs from 'fs'
import os from 'path'
import { debounce } from 'underscore'
import { doc, rootNamespace } from '../utils'


const stylesheetHeader = () => `
/**
 * This is a dynamically generated stylesheet
 * Modifications to this file will be mercilessly
 * overwritten by the ${rootNamespace} package.
 * @author: Tuomas Hatakka
 * @repository: https://github.com/tuomashatakka/reduced-dark-ui/
 * @license: https://github.com/tuomashatakka/reduced-dark-ui/LICENSE.md
 */`

const stylesheetPath = os.resolve(os.join(__dirname, '..', '..', 'styles', 'definitions', 'config.less'))
const generateRuleSet = (arr) => arr.map(o => generateRulesFor(o)).join('\n')
const generateLessVariableSet = (arr) => arr.map(rules => generateRulesFor({rules, indent: "@config-"})).join('\n')
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

  if (!isNaN(parseInt("@config")))
    Array(parseInt(indent)).fill('\t')

  val = (val ? val.toJSON ? val.toJSON() : val : false)
    .toString()
    .trim()

  if (val.endsWith(';'))
    val = val.substr(0, val.length - 1)

  return `\n${indent}${attr}: ${val};`
}


const applyStylesheet = debounce((pack, output) => {
  let { path, stylesheets } = pack
  let contents = stylesheetHeader() + output

  fs.writeFile(
    stylesheetPath,
    contents,
    'utf8',
    () => {

      stylesheets.forEach(
      stylesheet => {
        let sourcePath = stylesheet[0]

        try {
          let source = atom.themes.loadLessStylesheet(sourcePath)
          let params = { sourcePath, }
          let disposable = atom.styles.addStyleSheet(
            source,
            params )
          pack.onDidDeactivate(() => disposable.dispose())
        }

        catch(e) {
          if (atom.devMode)
            console.log("Error at reading the stylesheet in", sourcePath)
        }

    })})
}, 500)


const provideConfigToLess = (rules={}) => {
  let pack = atom.packages.getLoadedPackage(rootNamespace)
  let confrules = {}
  console.log(rules, pack)

  if (!pack)
    return

  for (let attr in rules) {
    if (rules[attr].branch)
      confrules[attr] = rules[attr].value }
  let output = generateLessVariableSet([confrules])
  console.log(output)
  let x = setImmediate(
    () => applyStylesheet(pack, output))
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
  resetConfigStylesheet,
  stylesheetPath,
}
