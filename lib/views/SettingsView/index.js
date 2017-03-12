'use babel'

import addTabView from './adapter'
import observe from './register'

// TODO: Remove observeThemeView after 1.16 update

export const observeThemeView = () => observe()
export default addTabView
