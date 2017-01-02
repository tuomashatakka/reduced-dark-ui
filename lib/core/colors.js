'use babel'
import { doc, rootNamespace } from '../main'


const template = (selector, rules) =>
  `${selector} { ${rules} }\n`

const important = (val) =>
  `${val} !important`

const getStyleElement = () => {
  let el = document.body.appendChild(
           document.querySelector(['style', rootNamespace].join('.')) ||
           document.createElement("style"))

  el.setAttribute('class', rootNamespace)
  return el
}


export const generateRule = (attr, val, indent=1) => {
  indent = Array(indent).fill('\t')
  return `\n${indent}${attr}: ${val};`
}


export const rulesFor = ({classNames, rules}) => {

  let buffer = Object.keys(rules).reduce(
    (result, attr) =>
     result += generateRule(attr, rules[attr]), ""
  )

  let selector = classNames.reduce(
    (result, className) =>
     result += (result ? ', ' : '\n') + ('.' + className), ""
   )

  return template(selector, buffer)
}


export const ruleSet = (arr) =>
  arr.map(o => rulesFor(o)).join('\n')


export const remove = () =>
  getStyleElement().remove()


export const append = () => {

  let el = getStyleElement()
  let accent = doc.getAttribute(rootNamespace + '-highlightcolor')

  let rules = [{
    classNames: ['accent', 'active', 'selected'],
    rules: {
      color: important(accent),
    }
  }]

  el.textContent = ruleSet(rules)
  return el
}


export default append
