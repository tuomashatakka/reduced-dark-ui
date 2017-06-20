'use babel'
import { Disposable } from 'atom'

export function handleIconURI (path) {
  console.log("icon uri called :)))")
}


export function registerURIHandler () {
  atom.workspace.addOpener( (uri) => {
    if (uri && uri.indexOf('atom://icons/') === 0) {

      let dispose = function () {

      }
      let disposable = new Disposable(dispose)
      return disposable
    }
  }
  )
}
