'use babel'
import fs from 'fs'
import path from 'path'
import http from 'https'

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
      api_key_path = 'local/googleapis.webfonts.key.txt',


      updateFontLists = (fp=null) => {
        let pack = atom.packages.getLoadedPackage('reduced-dark-ui')
        let root = pack.getMainModulePath()
        let filepath = path.resolve(root, fp || api_key_path)
        let url = generateUpdateUrlAddress(filepath)
        console.log(url);

        if (!url)
          return

        let accrual = []
        http.get(url, res => {

          // DEBUG: Remove the console log before pushing
          console.info(url, res)

          console.log('statusCode:', res.statusCode);
          console.log('headers:', res.headers);

          res.setEncoding('utf8')
          res.on('data', data => accrual.push(data))
          res.on('end', () => {
            let received = JSON.parse(accrual.join(''))
            let targetPath = path.join(root, 'assets', 'fonts', 'google.fonts.json')
            fs.writeFileSync(targetPath, received)
          })
        })
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
          console.info(require, filepath)
          key = fs.readFileSync(filepath, 'utf8')
          return key.toString().trim()
        }
        catch (error) {
          return null
        }
      }

export default updateFontLists
