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
  os.resolve(os.join(__dirname, '..', '..', 'styles', 'definitions', 'config-user.less'))

const template = (selector, rules) =>
  `${selector} { ${rules} }\n`

const resetStyles = () =>
  false // applyStyles()

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
  else
    indent = '@config-'
  val = val ? val.toJSON ? val.toJSON() : val : false
  if (typeof val === 'object')
    val = true
  return `\n${indent}${attr}: ${val};`
}

const applyStylesheet = (pack, output) => {
  let { path, stylesheets, stylesheetDisposables } = pack

  console.log(output)
  console.log(stylesheetHeader)

  fs.writeFile(
    stylesheetPath,
    stylesheetHeader + output,
    'utf8',
    (o) => {
      console.log(o)
      stylesheets.forEach(
        stylesheet => {
          console.log(stylesheet)
          atom.styles.addStyleSheet(
            atom.packages.themeManager.loadLessStylesheet(stylesheet[0])
          )
        }
      )
      // Remove the old ones
      stylesheetDisposables.dispose()

      //pack.deactivate({ update: true })
      //setImmediate( () => pack.activate({ update: true }) )
    }
  )

}

const applyStyles = (rules={}) => {

  let pack = atom.packages.getLoadedPackage(rootNamespace)

  let confrules = {}
  for (let attr in rules) {
    confrules[attr] = rules[attr].value
  }
  let output = generateLessVariableSet([confrules])

  if (!pack)
    return

  let x = setImmediate(() => applyStylesheet(pack, output))
  console.log("XXX", x)
}

export default
  applyStyles

export {
  applyStyles,
  resetStyles,
  stylesheetPath,
}
