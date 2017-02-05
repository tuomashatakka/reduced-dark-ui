'use babel'
import fs from 'fs'
import fp from 'path'
const BASE_PATH = fp.resolve(__dirname + '/../../assets/fonts')
const BASE_URL = "https://fonts.googleapis.com/css"

export default function (cmd, ...args) {
  let name = args[0]
  let vendor = args.length > 1 ? args[1] : 'google'
  let mgr = FontsCache.init({name, vendor})
  console.log(cmd, name);
  switch (cmd) {

    case "families":
      emit('load', mgr.fonts)
      emit('names', mgr.families())
      break

    case "names":
    emit('load', mgr.fonts)
      emit('names', mgr.families())
      break

    case "variants":
      emit('variants', mgr.variants())
      break

    default:
    case "font-face":
      var data = mgr.fontFace()
      emit('load', data)
      break
  }
  return mgr
}

function readJSON (f) {
  let file = fp.resolve(BASE_PATH + '/' + f)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function getFonts (vendor='google') {
  let collection = {}
  try {
    collection[vendor] = readJSON(`${vendor}.fonts.json`).items
    emit('font:loaded', collection) }

  catch (e) {
    emit('font:error', e) }

  return collection

}

const FontsCache = {
  init({name, vendor}) {
    this.fonts = getFonts()
    this.name = name
    this.vendor = vendor
    return this
  },

  families () {
    let fonts
    if (!this.vendor)
      fonts = Object.keys(this.fonts).reduce((ret, itr) => [...ret, ...itr], [])
    else
      fonts = this.fonts[this.vendor]
    return fonts.map(font => font.family)
  },

  isLocal () {
    return this.fonts[this.vendor]
          .find(font => font.family === this.name)
  },

  variants () {
    let f = this.fonts[this.vendor]
                .find(font => font.family === this.name)
    let defaults = [], n = 1
    while (n < 10) {
      defaults.push ([n++, "00"].join(''))
    }
    return f ? f.variants : defaults
  },

  files () {
    let f = this.fonts[this.vendor]
                .find(font => font.family === this.name)
    return f ? f.files : []
  },

  urlFor () {
    let safeName = (this.name || '').replace(/\s+/g, '+')
    let styles = this.variants().join(',')
    if (this.isLocal())
      return `${BASE_URL}?family=${safeName}:${styles}`
    return ''
  },

  fontFace() {
    console.log(this)
    if (!this || !this.files)
      return
    let variants = this.files()
    let stream = []
    let def = (src, style='regular', weight='400') => `@font-face {
    font-family: ${this.name};
    font-style: ${style};
    font-weight: ${weight};
    src: local("${this.name}"), url("${src}") format('woff2')}`

    for (let variant in variants) {
      let src = variants[variant]
      let weight = parseInt(variant.substr(0, 3))
      let style = variant.substr(3)

      if (isNaN(weight))
        weight = 400
      if (!style || style.length == 0 || style ==='ular')
        style = 'normal'
      stream.push(
        def(src, style, weight))
    }
    return stream.join('\n')
  }
}
