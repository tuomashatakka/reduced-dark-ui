'use babel'
import CF from './functions'

const parseColor = (c={}) =>
  `rgba(${c.red || 0}, ${c.green || 0}, ${c.blue || 0}, ${c.alpha || 1})`


let color = {
  WHITE: { red: 255, green: 255, blue: 255, alpha: 1 },
  BLACK: { red: 0, green: 0, blue: 0, alpha: 1 },
}


const RAW = {
  bg:          '#201f23',
  darker:      '#252429',
  dark:        '#29292e',
  gray:        '#4f4f59',
  light:       '#cbc9c9',
  lighter:     '#dedede',
  white:       '#eceeef',
  alternative: '#3bb3f6',
  keyword:     '#87b2ce',
  numbers:     '#b17ebd',
  include:     '#e969cd',
  error:       '#f52847',
  annotation:  '#ed3945',
  warning:     '#f4e795',
  success:     '#10faad', //'#2dffa0',
  highlight:   '#10faad',
  main:        '#59edbc',
}


const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']


const resolveHexString = (col) => {

  let arr = Array.from(col.substr(1))
  let red   = arr.splice(0, 2)
  let green = arr.splice(0, 2)
  let blue  = arr.splice(0, 2)

  let char  = x => {
    let i = hex.findIndex(
      o => o == x.toString().toLowerCase());
    return i === -1 ? 0 : i
  }

  let digest = d => {
    let x = 1, r = 0, c
    while((c = d.pop())) {
      r += char(c) * x
      x *= 16 }
      return r }

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
