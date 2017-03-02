'use babel'
import CF from './functions'

const parseColor = (c={}) =>
  `rgba(${c.red || 0}, ${c.green || 0}, ${c.blue || 0}, ${c.alpha || 1})`


let color = {
  WHITE: { red: 255, green: 255, blue: 255, alpha: 1 },
  BLACK: { red: 0, green: 0, blue: 0, alpha: 1 },
}


const RAW = {
  BG:          '#201f23',
  DARKER:      '#252429',
  DARK:        '#29292e',
  GRAY:        '#4F4F59',
  LIGHT:       '#CBC9C9',
  LIGHTER:     '#DEDEDE',
  WHITE:       '#ECEEEF',
  ALTERNATIVE: '#3bb3f6',
  KEYWORD:     '#87B2CE',
  NUMBERS:     '#b17ebd',
  INCLUDE:     '#e969cd',
  ERROR:       '#f52847',
  ANNOTATION:  '#ed3945',
  WARNING:     '#f4e795',
  SUCCESS:     '#10faad', //'#2dffa0',
  HIGHLIGHT:   '#10faad',
  MAIN:        '#59edbc',
}


const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
const resolveHexString = (col) => {
  let arr = Array.from(RAW[col].substr(1))
  let red   = arr.splice(0, 2)
  let green = arr.splice(0, 2)
  let blue  = arr.splice(0, 2)
  let char  = x => { let i = hex.findIndex(o => o == x.toString()); return i === -1 ? 0 : i }
  let digest = d => {
    let x = 1, c = null, r = 1
    while((c = d.pop())) {
      r += char(c) * x
      x *= 16 } return r }

  return {
    red: digest(red),
    green: digest(green),
    blue: digest(blue),
    alpha: 1 }
}

export {
  hex,
  resolveHexString,
  RAW,
  color,
  parseColor,
}
export default CF
