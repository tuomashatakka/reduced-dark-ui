'use babel'


export function iconFactory({icon, iconset='glyphicon', size}) {
  let tag = 'span';
  return [
    "<",
    tag,
    " class='",
    ['icon', iconset, iconset + '-' + icon].join(" "),
    "'",
    size ? ("style='font-size: '"+size) : '',
    "></",
    tag,
    ">"
  ].join('')
}


export const FORMAT_FLAGS = {
  CAPITALIZE_ONLY_FIRST: 'no-capitalize',
}
/**
 * Outputs a string that has all dashes and underscores stripped,
 * whitespaces concatenated and first letter of each word capitalized
 *
 * Flags:
 *  no-capitalize         Capitalizes only the first letter of the string if the flag
 *
 * @method formatTitle
 * @param  {string}    string     String to format
 * @param  {Array}     [flags=[]] Additional processing options
 * @return {string}               Formatted string
 */
export function formatTitle(string, ...flags) {

  const hasFlag = F =>
    flags.indexOf(F) !== -1

  if(!string)
    return ''

  let n, parts = string
      .replace(/(-|_)+/g, () => ' ')
      .split(/\s/)

  if (hasFlag(FORMAT_FLAGS.CAPITALIZE_ONLY_FIRST))
    parts[0] = parts[0] ?
               parts[0][0].toUpperCase() +
               parts[0].substring(1) : ''

  else
    for(n in parts) {
      if (parts[n].length > 0)
          parts[n] =
          parts[n][0].toUpperCase() +
          parts[n].substring(1)}

  return parts.join(' ')
}


export function link({url, content}) {
  return ["<a href='", url, "'>", content, "</a>"].join('');
}


export function flatten (o, path=[]) {
  let accumulated = {}
  for (let key in o) {
    let iter = o[key]
    let props = Object.keys(iter)
    if (iter.properties) {
      accumulated = Object.assign({},
        accumulated,
        flatten(iter.properties, path.concat([key]))
      )
      props = props.filter(key => key !== 'properties')
    }
    props = props.reduce((a, k) => Object.assign({}, a, {[k]: iter[k]}), {})
    props.path = path
    props.branch = !iter.properties
    accumulated = Object.assign( {}, accumulated, {[key]: props} )
  }
  return accumulated
}


const uuid = () => {

  // Copied from
  // http://stackoverflow.com/posts/873856/revisions

  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}


const pkg = require('../package.json')
const doc = document.documentElement
const { configSchema: conf, name: rootNamespace } = pkg
const namespace = (name, delim=false) => {
  let pt = delim ? '.' : '-'
  if (name.constructor.name === 'Array')
    name = name.join(pt)
  return [rootNamespace, name].join(pt)
}

export {
  rootNamespace,
  namespace,
  conf,
  doc,
  pkg,
  uuid,
}
