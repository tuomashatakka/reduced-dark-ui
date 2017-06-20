'use babel'
import { color } from './index'

const { round }   = Math
const channels    = ['red', 'green', 'blue']
const CF = {

  eachChannel: (fnc, ...args) => {
    let out = {}
    for (let ch of channels) {
      out[ch] = fnc(ch, ...args)
    }
    return out
  },

  luminance: (c={}) => round((c.red || 0 + c.blue || 0 + c.green || 0) / 3),
  mix: (a={}, b={}, amount=0.5) => ({ ...a, ...CF.eachChannel(ch => round(a[ch] * (1 - amount) + b[ch] * amount)) }),
  saturate: (c, amount=0.5) => {
    let lum          = CF.luminance(c)
    let cmp          = lum / 255
    let distribution = CF.eachChannel(ch => (c[ch] - lum) / 255)
    let proc         = CF.eachChannel(ch => c[ch] + (distribution[ch] - cmp) * amount * 255)
    return { ...c, ...CF.eachChannel(ch => round(proc[ch] < 255 ? (proc[ch] > 0 ? proc[ch] : 0) : 255)) }
  },
  desaturate: (c, amount=0.5) => ({ ...c, ...CF.eachChannel(ch => round( c[ch] + (CF.luminance(c) - c[ch]) * amount )) }),
  dim: (a, amount=0.5) => CF.mix(a, color.BLACK, amount),
  fade: (a, alpha=0.5) => ({ ...a, alpha }),
  lighten: (a, amount=0.5) => CF.mix(a, color.WHITE, amount),
  multiply: (a, b, mix=0.5) => CF.mix(a, CF.eachChannel(ch => a[ch] * ( b[ch] / 255 )), mix),
}

export default CF
