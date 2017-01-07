'use babel'
import { render } from 'react-dom'
import Slider from '../components/Slider.jsx'


function observeSettingsPanel () {
  return atom.workspace.onDidOpen(item => checkIfSettingsOpened(item))
}

function checkIfSettingsOpened ({item, uri}) {
  if (uri !== 'atom://config')
    return false

  // TODO: Finish me
  // let pack = item.panelsByName['reduced-dark-ui']
  // if (pack) {
  //   let {sections} = pack
  //   let uiScaleEditor = sections.find('atom-text-editor[type="number"]')
  //   let pos = uiScaleEditor.position()
  //   let key = uiScaleEditor.attr('id')
  //   uiScaleEditor.after('<div class="range">')
  //   let dragged = false
  //   render(<Slider />, uiScaleEditor.next().get(0))
  // }
}

export {
  observeSettingsPanel
}
