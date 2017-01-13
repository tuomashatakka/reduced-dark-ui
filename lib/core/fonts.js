'use babel'
import path from 'path'
import updateFontLists from '../proc/refetchFontLists'
import { writeFile, readFile, cache } from '../utils'

const error = (err) => atom.devMode && console.warn(`
Could not fetch new fonts for the Reduced Dark UI theme:
${err}
Make sure you have a valid Google API key in the
reduced-dark-ui/local/googleapis.webfonts.key.txt`)

export const
      fetchFontLists = () => {
        let resolve = updateFontLists()

        // DEBUG: Remove the console log before pushing
        resolve
        .then(data => {
          // DEBUG: Remove the console log before pushing
          if (atom.devMode)
            console.info('Fetching fonts data was successful')
          writeFile({
            ...data,
            targetPath: getFontDataPath('google'),
            format: 'json'})
        })
        .catch(err => error(err))
        .then(getFontData)
      },

      getFontDataPath = (vendor='') => {
        let pack = atom.packages.getLoadedPackage('reduced-dark-ui')
        if (!pack)
          return null
        if (vendor.length)
          vendor += '.'
        return path.resolve(`${pack.path}/assets/fonts/${vendor}fonts.json`)
      },

      getFontData = () => {
        let path = getFontDataPath('google')
        let data = localStorage.getItem('fonts.google')

        if (c && c.length)
          return JSON.parse(c)

        return new Promise(resolve => {
          readFile(path)
          .catch(e => atom.devMode && console.error(e))
          .then(data => {
            localStorage.setItem('fonts.google', JSON.stringify(data))
            resolve(data)
          })
        })
      }
