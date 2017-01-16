'use babel'
import dev from '../tools'
import glob from 'glob'
import { rootNamespace } from '../utils'

const ICON_CLASS_NAME = 'display-icon'
const getHaystack = () =>
  ['ion', 'fa', 'icon']


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


const makeIcon = ({ iconset, icon, className }) => {
  let el = document.createElement('span')

  className = [
    iconset,
    iconset + '-' + icon,
    className ]
    .join(' ')

  el.setAttribute(
    'class',
    className )

  return el
}


const getIcons = (icon=null) => {

  let descriptor = 'reduced-dark-ui.icons'
  let icons = atom.config.get(descriptor, {}) || {}

  if (icon && icons && icons[icon]) {
    let ico = icons[icon]

    // Check that the icon has both icon and iconset properties set
    if (ico.iconset && ico.icon)
      return icons[icon]

    // If the object is not of right format, return null
    return null
  }

  // Return all icons if no icon is specified
  return icons || {}
}


const updateIcons = (payload) => {

  let icons = getIcons()
  if (payload instanceof Object)
    icons = { ...icons, ...payload }

  return atom.config.set('reduced-dark-ui.icons', icons)
}


const clearIcons = () => {
  atom.config.set('reduced-dark-ui.icons', {})
}


const fetchIconLists = () => {
  let catalog = {},
      pack = atom.packages.getLoadedPackage(rootNamespace),

      onPathsResolved = (response) => {

        for (let path of response) {

          if (path.endsWith('material.json'))
            continue

          let key, test = /.*?\/([\w]+)\.json/,
              assign = (_, name) => key = name

          // Resolve the icon package name. The
          // replace function name is misleading
          // since its return value is simply ignored
          path.replace(test, assign)
          catalog[key] = require(path)
        }
        return catalog
  }

  // Return a promise that is resolved on glob result
  return new Promise( (resolve, reject) => {
    glob(
      pack.path + '/assets/iconsets/**/*.json',
      (_, res) => resolve(onPathsResolved(res)))
  })
}


export {
  getHaystack,
  makeIcon,
  getIcons,
  updateIcons,
  clearIcons,
  fetchIconLists,
  ICON_CLASS_NAME,
}
