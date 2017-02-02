'use babel'
import fs from 'fs'
import fp from 'path'
import http from 'https'

const BASE_PATH = fp.resolve(__dirname + '/../../assets/fonts')
const BASE_URL = "https://fonts.googleapis.com/css"

export default function (cmd, ...args) {
  let name = args[0]
  let vendor = args.length > 1 ? args[1] : 'google'
  let mgr = new FontsCache({name, vendor})
  switch (cmd) {

    case "families":
      emit('load', mgr.fonts)
      emit('names', mgr.families())
      waiting = false
      break

    case "names":
      emit('names', mgr.families())
      waiting = false
      break

    case "variants":
      emit('variants', mgr.variants())
      waiting = false
      break

    default:
    case "font-face":
      let data = mgr.fontFace()
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

class FontsCache {
  constructor({name, vendor}) {
    this.fonts = getFonts()
    this.name = name
    this.vendor = vendor
  }

  families () {
    let fonts
    if (!this.vendor)
      fonts = Object.keys(this.fonts).reduce((ret, itr) => [...ret, ...itr], [])
    else
      fonts = this.fonts[this.vendor]
    return fonts.map(font => font.family)
  }

  variants () {
    return this.fonts[this.vendor]
          .find(font => font.family === this.name)
          .variants
  }

  files () {
    return this.fonts[this.vendor]
          .find(font => font.family === this.name)
          .files
  }

  urlFor () {
    let safeName = this.name.replace(/\s+/g, '+')
    let styles = this.variants().join(',')
    return `${BASE_URL}?family=${safeName}:${styles}`
  }

  fontFace() {
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
