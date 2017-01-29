'use babel'
import fs from 'fs'

export default function (args) {
  const data = readRawJSON(args)
  emit('icons:done', data)
}

function readRawJSON (baseDir) {

  const dir = baseDir + '/assets/iconsets'
  let collection = null
  try {

    collection.ion      = JSON.parse(fs.readFileSync(dir + '/ionicons/ion.json', 'utf8'))
    collection.icomoon  = JSON.parse(fs.readFileSync(dir + '/icomoon/icomoon.json', 'utf8'))
    collection.fa       = JSON.parse(fs.readFileSync(dir + '/font-awesome/fa.json', 'utf8'))
  }
  catch (e) {
    emit('icons:error', e)
  }
  return collection

}
