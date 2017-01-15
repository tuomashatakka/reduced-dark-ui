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
      /**
       * Makes an http request to fetch a list of all fonts
       * to the google's webfonts API. If the request is successful,
       * writes the received data into a file in assets/fonts.
       */
      fetchFontLists = () => {
        let resolve = updateFontLists()

        // Stop if the request failed
        if (!resolve) {
          if(atom.devMode)
            error(resolve)
          return
        }

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

      /**
       * Returns the path for the JSON file with available fonts
       */
      getFontDataPath = (vendor='') => {
        let pack = atom.packages.getLoadedPackage('reduced-dark-ui')
        if (!pack)
          return null
        if (vendor.length)
          vendor += '.'
        return path.resolve(`${pack.path}/assets/fonts/${vendor}fonts.json`)
      },

      /**
       * Returns a promise that provides fonts that are available
       * if successful. Prints a console message on error if the dev mode
       * is enabled.
       */
      getFontData = () => {
        let path = getFontDataPath('google')
        let data = localStorage.getItem('fonts.google')

        return new Promise(resolve => {
          if (data && data.length)
            resolve(JSON.parse(data))
          readFile(path)
          .catch(e => atom.devMode && console.error(e))
          .then(data => {
            localStorage.setItem('fonts.google', JSON.stringify(data))
            resolve(data)
          })
        })
      }
