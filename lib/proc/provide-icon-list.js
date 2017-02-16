'use babel'
import fs from 'fs'

export default function (args) {
  const data = getIcons(args)
  emit('icons:done', data)
}

function readJSON (f) {
  return JSON.parse(fs.readFileSync(f, 'utf8'))
}

function getIcons (baseDir) {
  const dir = baseDir //+ '/assets/iconsets'
  let collection = {}
  try {
    collection.ion      = readJSON(dir + '/ionicons/ion.json')
    emit('icons:loaded', collection)

    collection.icomoon  = readJSON(dir + '/icomoon/icomoon.json')
    emit('icons:loaded', collection)

    collection.fa       = readJSON(dir + '/font-awesome/fa.json')
    emit('icons:loaded', collection) }

  catch (e) {
    emit('icons:error', e) }

  return collection

}
