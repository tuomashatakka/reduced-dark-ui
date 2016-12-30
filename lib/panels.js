'use babel'
import { getHaystack, getIcons, updateIcons, makeIcon, ICON_CLASS_NAME } from './core/icons'


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
  if (atom.devMode)
    console.log("I", match + '-ly found the icon', icon, 'of', iconset, 'in', el)
  return { iconset, icon }
}

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
  console.log(test);
  let c

  while (test.length) {
    c = test.pop()
    let pkg = atom.packages.getLoadedPackage(c)
    console.log(c, pkg);

    if (pkg)
      return pkg
  }
  return {}
}

export const setPanelIcons = (q='left') => {

  let panels = atom.workspace.getPanels(q)

  if (!panels)
    return

  let savedIcons = getIcons()
  panels.forEach(panel => {

    let node = getPanelItemNode(panel)
    let { name } = resolvePanelPackage(panel)
    let { parentElement } = node
    let className = ICON_CLASS_NAME
    let ico

    console.log(node.parentElement, name, savedIcons)
    if (name && !savedIcons[name]) {
      ico = findElementIcon(node)
      updateIcons({[name]: ico})
    }
    else
      ico = savedIcons[name]
    console.log(savedIcons[name])
    console.log("ICO:", ico)
    // Short-circuit if the icon is already applied
    if (parentElement.firstChild.classList.contains(className))
      return

    let iconNode = makeIcon({...ico, className })

    parentElement.insertBefore(
      iconNode,
      node)


  })
}
