'use babel'

import { rootNamespace } from '../utils'
import { Task } from 'atom'

const ICON_CLASS_NAME = 'display-icon'
const HAYSTACK = ['ion', 'fa', 'icon']


/**
 * @method findElementIcon
 *
 * Walks the DOM for the given HTML node until one of the haystack's
 * classes is found. Returns the found icon's name and icon set
 *
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
    let haystack = HAYSTACK

    if (!el)
      return { iconset, icon }

    while (!match && haystack.length) {
      iconset = haystack.pop()
      match = el.querySelector('.' + iconset)
      if (!match) continue

      let cls = match.className || ""
      let cond = new RegExp('\\s' + iconset + '-([\\w-]+)', 'gi')
      cls.replace(cond, (_, name) => {
        icon = name
        return _ })
    }
    return { iconset, icon }
  },


  makeIcon = ({ iconset, icon, className }) => {
    let el = document.createElement('span')
    className = [
      iconset, iconset + '-' + icon, className ]
      .join(' ')
    el.setAttribute('class', className)
    return el
  },

  getIcons = (icon=null) => {

    let descriptor = 'reduced-dark-ui.icons'
    let icons = atom.config.get(descriptor, {}) || {}
    if (icon && icons && icons[icon]) {

      // Check that the icon has both icon and iconset properties set
      let ico = icons[icon]
      if (ico.iconset && ico.icon)
        return icons[icon]

      // If the object is not of right format, return null
      return null }

    // Return all icons if no icon is specified
    return icons || {}
  },

  updateIcons = (payload) => {
    let icons = getIcons()
    if (payload instanceof Object)
      icons = { ...icons, ...payload }
    return atom.config.set('reduced-dark-ui.icons', icons)
  },

  clearIcons = () =>
    atom.config.set('reduced-dark-ui.icons', {}),

  /**
   * @method fetchIconLists
   *
   * Starts an asynchronous process for reading the json files
   * in the icon sets' directories
   *
   * @return A promise that is resolved upon task completion
   */
  fetchIconLists = (returnTask=false) => {

    const { path } = atom.packages.getLoadedPackage(rootNamespace)
    let baseDir = path + '/assets/iconsets'
    let taskPath = require.resolve('../proc/provide-icon-list.js')
    if (returnTask)
      return Task.once(
        taskPath,
        baseDir)
    // Return a promise that is resolved on glob result
    return new Promise(
      (resolve, reject) => {
        let task = Task.once(
          taskPath,
          baseDir,
          function(data) {
            resolve(data)
        })
        task.on('icons:error',
                data => reject("TASK ERROR OHH NOES", data))

    })
  }


export {
  HAYSTACK,
  ICON_CLASS_NAME }
