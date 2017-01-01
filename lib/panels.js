'use babel'
import { getHaystack, getIcons, updateIcons, makeIcon, ICON_CLASS_NAME } from './core/icons'


/**
 * Walks the DOM for the given HTML node until one of the haystack's
 * classes is found. Returns the found icon's name and icon set
 * @method findElementIcon
 * @param  {HTMLNode}      el    HTML element to search the icon in
 * @return {Object}              An object containing the found icon and its
 *                               iconset. If no icon is found, returns the
 *                               defaults defined in the beginning of the
 *                               function
 */
export const findElementIcon = (el) => {

  let match = false
  let icon = 'ios-close-empty'
  let iconset = 'icon'
  let haystack = getHaystack()

  if (!el)
    return { iconset, icon }

  while (!match && haystack.length) {
    iconset = haystack.pop()
    match = el.querySelector('.' + iconset)

    if (!match)
      continue

    let cls = match.className || ""
    let cond = new RegExp('\\s' + iconset + '-([\\w-]+)', 'gi')

    cls.replace(cond, (_, name) => {
      icon = name
      return _
    })
  }

  return { iconset, icon }
}


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


export const resolvePanelPackage = (panel) => {

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


export const setPanelIcons = (q='left') => {

  let panels = atom.workspace.getPanels(q)

  if (!panels)
    return

  let savedIcons = getIcons()
  panels.forEach(panel => {

    let node = getPanelItemNode(panel)
    let name = resolvePanelPackage(panel)
    let { parentElement } = node
    let className = ICON_CLASS_NAME
    let ico

    // Short-circuit if the icon is already applied
    if (!atom.devMode && parentElement.firstChild.classList.contains(className))
      return

    if (name && !savedIcons[name]) {
      ico = findElementIcon(node)
      updateIcons({[name]: ico})
    }
    else
      ico = savedIcons[name]

    let iconNode = makeIcon({...ico, className })

    parentElement.insertBefore(
      iconNode,
      node)


  })
}
