'use babel'
import { resolveHexString } from './index'

const CTYPE = { HEX: 'hex', RGB: 'rgba', HSL: 'hsl', ATOM: 'atom' }
const PARSE = {
  HEX: (c) => resolveHexString(c),
  RGB: 'rgba',
  HSL: 'hsl',
}

class Color {

  red = 0
  green = 0
  blue = 0
  alpha = 1
  type = CTYPE.HEX

  constructor(...color) {

    let red, green, blue, alpha
    let col = color[0]

    if (!col)
      col = { red: 0, green: 0, blue: 0, alpha: 0 }

    if (col.toString().startsWith('#'))
      col = PARSE.HEX(col)

    let type = col.constructor.name
    if (type === 'Array') {
      color = color.length === 3 ? [...color, 1] : color;
      [red, green, blue, alpha] = color
    }
    else // if (type === 'Object' || type === 'Color')
      ({red, green, blue, alpha} = col)

    this.red = red || this.red
    this.blue = blue || this.blue
    this.green = green || this.green
    this.alpha = alpha || this.alpha
  }

  toString () {
    return this.toRGB()
  }

  toRGB () {
    let { red, green, blue, alpha } = this
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  toJSON (asObject=true) {
    let { red, green, blue, alpha } = this
    let obj = { red, green, blue, alpha }
    return asObject ? obj : JSON.stringify(obj)
  }
}

export default class Palette {

  colors = {}

  format (name) {
    this.set(name, 0, 0, 0)
  }

  add (name, ...color) {
    if (!this.colors[name])
      this.set(...color)
  }

  set(name, ...color) {
    this.colors[name] = new Color(...color)
  }

  get(name) {
    return this.colors[name] || new Color()
  }

  getRGB(name) {
    return (this.colors[name] || new Color()).toString()
  }

  process({ method, name, args=[] }) {
    let color = this.get(name)
    let processed = new Color(!method ? color : method.call(this, color, ...args)).toString()
    return processed
  }

}
