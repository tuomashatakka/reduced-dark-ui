'use babel'
import { join } from 'path'
import { readFileSync } from 'fs'

const getPathTo = (...name) => join(basePath, 'assets', 'iconsets', ...name)
const getURI = (name) => `${baseURI}/${name}/${name}.woff`
let basePath = null
let baseURI = 'atom://reduced-dark-ui/assets/iconsets'

export default function (dir, fontFamily='ionicons') {
  basePath = dir
  let path = getPathTo(fontFamily)
  let woff = getURI(fontFamily)
  let less = readFileSync(join(path, 'ionicons.less'), 'utf8')
  let query = new RegExp(`\.\/${fontFamily}\.woff`, 'g')
  less = less.replace(query, woff)

  return ({ [fontFamily]: less })
}
