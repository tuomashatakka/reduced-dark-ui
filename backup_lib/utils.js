'use babel';export function iconFactory({icon,iconset='glyphicon',size}){let tag='span';return['<',tag,' class=\'',['icon',iconset,iconset+'-'+icon].join(' '),'\'',size?'style=\'font-size: \''+size:'','></',tag,'>'].join('')}export const FORMAT_FLAGS={CAPITALIZE_ONLY_FIRST:'no-capitalize'};/**
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
 */export function formatTitle(string,...flags){const hasFlag=F=>flags.indexOf(F)!==-1;if(!string)return'';let n,parts=string.replace(/(-|_)+/g,()=>' ').split(/\s/);if(hasFlag(FORMAT_FLAGS.CAPITALIZE_ONLY_FIRST))parts[0]=parts[0]?parts[0][0].toUpperCase()+parts[0].substring(1):'';else for(n in parts){if(parts[n].length>0)parts[n]=parts[n][0].toUpperCase()+parts[n].substring(1)}return parts.join(' ')}export function link({url,content}){return['<a href=\'',url,'\'>',content,'</a>'].join('')}
