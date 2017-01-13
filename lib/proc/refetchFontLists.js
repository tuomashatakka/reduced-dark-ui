'use babel'
import fs from 'fs'
import path from 'path'
import http from 'https'
import { getFontDataPath } from '../core/fonts'

// const FIELDS = ?fields=items(category%2Cfamily%2Cfiles%2Ckind%2Cvariants)%2Ckind&key={YOUR_API_KEY}

const
      BASE_URL = "https://www.googleapis.com/webfonts/v1/webfonts",

      fields = [
        'family',
        'category',
        'variants'],

      // You'll need to add your own api key here
      // if you'd like to manually update the font listing.
      // The API does have a quota of 10000 requests per day
      // but I'm not willing to take a risk 🙋
      api_key_path = './local/googleapis.webfonts.key.txt',


      updateFontLists = (fp=null) => {
        let pack = atom.packages.getLoadedPackage('reduced-dark-ui')
        if (!pack)
          return

        let filepath = path.resolve(pack.path, fp || api_key_path)
        let url = generateUpdateUrlAddress(filepath)
        if (!url)
          return

        let accrual = []
        let promise = new Promise((resolve, reject) => {
          try {
            http.get(url, res => {

              // DEBUG: Remove the console log before pushing
              if (res.statusCode !== 200)
                reject(res.statusCode)
              res.setEncoding('utf8')
              res.on('error', (e) => reject(e))
              res.on('data', data => accrual.push(data))
              res.on('end', () => {
                let raw = accrual.join('')
                resolve({ raw })
              })
            })
            .on('error', e => reject(e))

          } catch (e) {
            reject(e)
          }
        })
        return promise
        // let contents = fs.writeFileSync()
      },

      generateUpdateUrlAddress = (filepath) => {
        let items = fields.join(','),
            API_KEY = getApiKey(filepath),
            ADDRESS = `${BASE_URL}?fields=items(${items})&key=${API_KEY}`
        return API_KEY ? ADDRESS : null },

      getUrlAddressForFont = (fontFamily) => {},


      getApiKey = (filepath) => {
        let key

        try {
          key = fs.readFileSync(filepath, 'utf8')
          return key.toString().trim()
        }
        catch (error) {
          return null
        }
      }

export default updateFontLists
