'use babel'
import dev from './tools'
import { findElementIcon, getIcons, updateIcons, clearIcons, makeIcon, ICON_CLASS_NAME } from './core/icons'
import { formatTitle, uuid } from './utils'


/**
 * Takes a panel instance and rturns the view item for that panel
 * @method getPanelItemNode
 * @return {HTMLNode} The element for the panel's first item
 */
export const getPanelItemNode = (panel, n=0) =>
  panel.item ? (panel.item.get ? panel.item.get(n) : panel.item) : {},


/**
 * Resolves identification details for a panel to use
 * in naming
 * @method getPanelSpecs
 * @param  {[type]}      panel [description]
 * @return {Object}            An object containing the panel's tag
*                              and class names
 */
    getPanelSpecs = (panel) => {
      let tag = null,
          classes = [],
          node = getPanelItemNode(panel)

      if (node.tagName && node.tagName !== 'DIV')
        tag = node.tagName.toLowerCase()

      if (node.classList && node.classList.length)
        classes = node.classList

      return { tag, classes }
    },


    resolvePanelIdentifier = (panel) => {

      let { tag, classes } = getPanelSpecs(panel)
      let test = [tag, ...classes]

      while (test.length) {
        let c = test.pop()
        let pkg = atom.packages.getLoadedPackage(c)

        if (pkg)
          return pkg.name
      }

      return tag || [...classes].join('-')
    },


    decoratePanel = (panel, keepExisting=true) => {

      let className = ICON_CLASS_NAME
      let forceReload   = keepExisting === false
      let packageClass  = resolvePanelIdentifier(panel)
      let name          = formatTitle(packageClass)
      let savedIcon     = getIcons(name)
      let el            = getPanelItemNode(panel)

      let   ico
      let { parentElement, firstElementChild: iconNode }
                        =  el
      let iconExists    =  parentElement.classList ?
                           parentElement.classList.contains(className) :
                           false

      // Short-circuit if the icon is already applied,
      // except if the keepExisting argument has a value of true,
      // in which case remove the old icon from the DOM and continue
      // execution normally
      console.log({parentElement, iconNode, iconExists, el})
      if (iconExists) {
        if (!forceReload) iconNode.remove()
        else return
      }
      ico = savedIcon
      if (forceReload || name && !savedIcon.icon) {
        ico = findElementIcon(el)
        updateIcons({[name]: ico})
      }

      let mainEditor = document.querySelector('atom-workspace-axis.vertical atom-pane > .item-views')
      iconNode = makeIcon({ ...ico, className })
      iconNode.addEventListener('click', () => {

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

      parentElement.insertBefore(iconNode, el)
      parentElement.classList
                   .add(['panel', packageClass]
                   .join('-'))
    },


    applyModalBackdropBlur = () => {

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
    },

    decorate = () => {
      let panels = atom.workspace.getPanels('left')
      let rightPanels = atom.workspace.getPanels('right')

      dev.message("Decorating panels")

      panels.concat(rightPanels)
            .forEach(decoratePanel)
    }
export default
  decorate
