'use babel'
import fs from 'fs'

export default function (args) {
  const data = readRawJSON(args)
  emit('icons:done', data)
}

function readRawJSON (baseDir) {

  const dir = baseDir //+ '/assets/iconsets'
  let collection = {}
  try {
    collection.ion      = JSON.parse(fs.readFileSync(dir + '/ionicons/ion.json', 'utf8'))
    emit('icons:loaded', collection)
    collection.icomoon  = JSON.parse(fs.readFileSync(dir + '/icomoon/icomoon.json', 'utf8'))
    emit('icons:loaded', collection)
    collection.fa       = JSON.parse(fs.readFileSync(dir + '/font-awesome/fa.json', 'utf8'))
    emit('icons:loaded', collection)
  }
  catch (e) {
    console.log(e);
    emit('icons:error', e)
  }
  return collection

}
