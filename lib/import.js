'use babel'
import { sync } from 'glob'

export default () =>
  sync(arguments[0] + '/!(index.js)')
  .map(o => require(o))
