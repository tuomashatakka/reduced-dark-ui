'use babel'
import { findElementIcon, getIcons, updateIcons, clearIcons, makeIcon, ICON_CLASS_NAME } from './core/icons'
import { formatTitle } from './utils'


/**
 * Takes a panel instance and rturns the view item for that panel
 * @method getPanelItemNode
 * @return {HTMLNode} The element for the panel's first item
 */
export const getPanelItemNode = (panel, n=0) => {
  let { item } = panel
  return item ? (item.get ? item.get(n) : item) : {}
}


export const getPanelSpecs = (panel) => {
  let tag = null,
      classes = [],
      node = getPanelItemNode(panel)

  if (node.tagName && node.tagName !== 'DIV')
    tag = node.tagName.toLowerCase()

  if (node.classList && node.classList.length)
    classes = node.classList

  return { tag, classes }
}


export const resolvePanelIdentifier = (panel) => {

  let { tag, classes } = getPanelSpecs(panel)
  let test = [tag, ...classes]

  while (test.length) {
    let c = test.pop()
    let pkg = atom.packages.getLoadedPackage(c)

    if (pkg)
      return pkg.name
  }

  return tag || [...classes].join('-')
}


export const decoratePanel = (panel) => {

  let el = getPanelItemNode(panel)
  let packageClass = resolvePanelIdentifier(panel)
  let name = formatTitle(packageClass)
  let savedIcon = getIcons(name)
  let { parentElement } = el
  let className = ICON_CLASS_NAME
  let ico
  console.log(el, packageClass)

  // Short-circuit if the icon is already applied
  if (!atom.devMode && parentElement.firstChild.classList.contains(className))
    return

  if (name && !savedIcon) {
    ico = findElementIcon(el)
    updateIcons({[name]: ico})
  }
  else
    ico = savedIcon

  let iconNode = makeIcon({
    ...ico,
    className })

  parentElement
    .insertBefore(iconNode, el)

  parentElement
    .classList
    .add(['panel', packageClass].join('-'))
}


export default (query='left') => {
  let panels = atom.workspace.getPanels(query)

  if (atom.devMode)
    atom.notifications.addInfo("Redecorating panels")
  panels.forEach(decoratePanel)
}
