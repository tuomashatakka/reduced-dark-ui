'use babel'
import { findElementIcon, getIcons, updateIcons, clearIcons, makeIcon, ICON_CLASS_NAME } from './core/icons'
import { formatTitle, uuid } from './utils'


/**
 * Takes a panel instance and rturns the view item for that panel
 * @method getPanelItemNode
 * @return {HTMLNode} The element for the panel's first item
 */
export const getPanelItemNode = (panel, n=0) => {
  let { item } = panel
  return item ? (item.get ? item.get(n) : item) : {}
}


/**
 * Resolves identification details for a panel to use
 * in naming
 * @method getPanelSpecs
 * @param  {[type]}      panel [description]
 * @return {Object}            An object containing the panel's tag
*                              and class names
 */
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

  let className = ICON_CLASS_NAME
  let el = getPanelItemNode(panel)
  let packageClass = resolvePanelIdentifier(panel)
  let name = formatTitle(packageClass)
  let savedIcon = getIcons(name)

  let { parentElement, firstChild: iconNode } = el
  let iconExists = parentElement.firstChild.classList.contains(className)
  let id, ico, label, checkbox

  // Short-circuit if the icon is already applied
  if (iconExists)
    return

  if (name && !savedIcon) {
    ico = findElementIcon(el)
    updateIcons({[name]: ico}) }

  else
    ico = savedIcon

  // label = document.createElement('label')
  // checkbox = document.createElement('input')
  // id = uuid()
  //
  // checkbox.setAttribute('id', id)
  // checkbox.setAttribute('type', 'checkbox')
  // checkbox.setAttribute('class', 'panel-toggle-switch')
  // label.setAttribute('for', id)
  iconNode = makeIcon({ ...ico, className })
  let mainEditor = document.querySelector('atom-workspace-axis.vertical atom-pane > .item-views')

  iconNode.addEventListener('click', () => {
    console.log(mainEditor, parentElement)
    parentElement.classList.toggle('open')
    let isOpen = parentElement.classList.contains('open')
    let s = mainEditor.getAttribute('style')
    let width = isOpen ? el.getBoundingClientRect().width : 0

    let styles = (s || '')
      .split(';')
      .map(o => o.split(':').map(q => q.trim()))
      .filter(o => o[0] !== 'left') || []

    styles = [...(styles.map( o => o.join(': ') ))]
    mainEditor.setAttribute(
      'style', styles.concat([`left: ${width}px`]).join('; '))
  })

  parentElement
    .insertBefore(iconNode, el)

  parentElement
    .classList
    .add(['panel', packageClass].join('-'))
}


export const applyModalBackdropBlur = () => {

  const observeVisibilityChanges = (modal) => {
    let classes = document.documentElement.classList
    let disposable =
        modal.onDidChangeVisible(
          visible => visible ?
            classes.add('modal-open') :
            classes.remove('modal-open'))
    modal.onDidDestroy( () => disposable.dispose() )

    if (modal.visible)
      classes.add('modal-open')
  }

  let modalContainer = document
     .querySelector('atom-panel-container.modal')
     .getModel()

  let modals = atom.workspace.getModalPanels()

  // Subscribe to existing panels' onDidChangeVisible event
  // & modals' container's onDidAddPanel event
  modals.forEach(
    modal => observeVisibilityChanges(modal))
  modalContainer.onDidAddPanel(
    item => observeVisibilityChanges(item.panel))
}


const decorate = (query='left') => {
  let panels = atom.workspace.getPanels(query)

  if (atom.devMode)
    atom.notifications.addInfo("Redecorating panels")

  panels.forEach(decoratePanel)
}

export default
  decorate
