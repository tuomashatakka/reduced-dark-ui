'use babel'
import path from 'path'
import http from 'https'
import dev from '../tools'
import updateFontLists from '../proc/refetchFontLists'
import { applyFonts } from './configuration'
import { writeFile, readFile, rootNamespace } from '../utils'

const error = (err) => dev.warn(`
Could not fetch new fonts for the Reduced Dark UI theme.
Make sure you have a valid Google API key in the
reduced-dark-ui/local/googleapis.webfonts.key.txt`, err)


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
          error(resolve)
          return
        }

        resolve
        .then(data => {
          dev.error('Fetching fonts data was successful')
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
          .catch(e => dev.error(e))
          .then(data => {
            localStorage.setItem('fonts.' + vendor, JSON.stringify(data))
            resolve(data)
          })
        })
      },

      getFontProperties = (query, vendor='google') => {
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
        }),

        updateFont = (font) => {
          return getFontFaceDefinition(font)
            .then(response => {
              let pack = atom.packages.getLoadedPackage(rootNamespace)
              if(response.raw)
                applyFonts(pack, response.raw)

            })
            .catch(e => dev.message(e))
        }
