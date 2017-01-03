'use babel'
import fs from 'fs'
import os from 'path'
import { doc, rootNamespace } from '../main'

const stylesheetHeader = `/*
This is a dynamically generated rule set.
Modifications to this file will be mercilessly
overwritten by the ${rootNamespace} package.
@author: Tuomas Hatakka
@repository: https://github.com/tuomashatakka/reduced-dark-ui/
@license: https://github.com/tuomashatakka/reduced-dark-ui/LICENSE.md
*/`

const stylesheetPath =
  os.resolve(os.join(__dirname, '..', '..', 'styles', 'definitions', 'accent.less'))

const template = (selector, rules) =>
  `${selector} { ${rules} }\n`

const resetColors = () =>
  applyStyles()

const generateRuleSet = (arr) =>
  arr.map(o => generateRulesFor(o)).join('\n')

const generateLessVariableSet = (arr) =>
  arr.map(rules => generateRulesFor({rules, indent: "@"})).join('\n')

const generateRulesFor = ({rules, classNames, indent}) => {
  let buffer = Object.keys(rules).reduce(
    (result, attr) =>
     result += generateRule(attr, rules[attr], indent), "")

  if (!classNames)
    return buffer

  let selector = classNames.reduce(
    (result, className) =>
     result += (result ? ', ' : '\n') + ('.' + className), "")
  return template(selector, buffer)
}

const generateRule = (attr, val, indent=1) => {
  if(indent !== '@')
    Array(indent).fill('\t')
  return `\n${indent}${attr}: ${val};`
}

const applyStyles = (rules, theme={}) => {

  let pack = atom.packages.getLoadedPackage(rootNamespace)
  let { settings } = theme

  let confrules = {}
  for (let attr in settings) {
    confrules[attr] = settings[attr].value
  }
  let output = generateLessVariableSet([rules, confrules])

  if (!pack)
    return

  console.log(rules, output)
  console.log(theme)
  fs.writeFile(
    stylesheetPath,
    stylesheetHeader + output,
    'utf8',
    () => {
      pack.deactivate({ update: true })
      setImmediate( () => pack.activate({ update: true }) )
    }
  )
}

export default
  applyStyles

export {
  applyStyles,
  resetColors,
  stylesheetPath,
}
