'use babel'
import path from 'path'
import http from 'https'
import updateFontLists from '../proc/refetchFontLists'
import { debounce } from 'underscore'
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
      getFontData = (vendor='google') => {
        let path = getFontDataPath(vendor)
        let data = localStorage.getItem('fonts.' + vendor)

        return new Promise(resolve => {
          if (data && data.length)
            resolve(JSON.parse(data))
          readFile(path)
          .catch(e => atom.devMode && console.error(e))
          .then(data => {
            localStorage.setItem('fonts.' + vendor, JSON.stringify(data))
            resolve(data)
          })
        })
      },

      getFontProperties = (query, vendor='google') => {
        let path = getFontDataPath(vendor)
        let data = getFontData(vendor)
        return new Promise(
          resolve => data.then(
            collection => resolve(
              JSON
              .parse(collection).items
              .find(o => o.family == query))
          )
        )
      },

      getUrlAddressForFont = (fontFamily) => {
        if (typeof fontFamily === 'string') {
          let base = "https://fonts.googleapis.com/css?family="
          let name = fontFamily.replace(/\s+/g, '+')
          return new Promise(resolve => {

            getFontProperties(fontFamily)
              .then(props => {
                let variants = props.variants.join(',')
                resolve(base + name + ':' + variants)
              })
          })
        }
      },

      getFontFaceDefinition = (fontFamily) =>
        new Promise((resolve, reject) => {

          if (!fontFamily)
            reject("No font family specified")

          let
            url = getUrlAddressForFont(fontFamily),
            accrual = []

          url.then(uri => {

            try {
              http
                .get(uri, res => {

                  res.setEncoding('utf8')
                  if (res.statusCode !== 200)
                    reject(res.statusCode)

                  res.on('error', (e) =>
                    reject(e))

                  res.on('data', data =>
                    accrual.push(data))

                  res.on('end', () =>
                    resolve({ raw: accrual.join('') }))
                })
                .on('error', e =>
                  reject(e))
            }
            catch (e) {
              reject(e)
            }
          })
        })
