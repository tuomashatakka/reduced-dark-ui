'use babel'

import { render } from 'react-dom'
import React, { Component } from 'react'
import { fetchIconLists } from '../core/icons'


const Button = (props) => {
  let { type } = props || {type: 'default'}
  let className = [
    'btn',
    'btn-' + type,
    'state-' + type,
    type,
  ].join(' ')
  return (
    <a
      className={className}
      onClick={e => props.onClick ? props.onClick(e) : false}>
      {props.children}
    </a>
  )
}


const Icon = (props) => {
  let { iconset, icon } = props
  let className = [
    'icon',
    iconset,
    iconset + '-' + icon,
    icon,
  ].join(' ')
  return <article
    className={className} />
}


class IconPreviewAdapter {

  constructor(modal) {
    this.catalog = {}
    this.elements = {
      icons: [],
      sections: []
    }

    this.fetch =
      fetchIconLists()
      .then(
      catalog => {

        // Reduce an element cache from the catalog
        this.catalog = catalog
        for (let iconset in catalog) {

          let start = this.elements.icons.length
          for (let icon in catalog[iconset]) {

            //let unicode = iconset[icon]
            let el = this.getElementForIcon({iconset, icon})
            this.elements.icons.push(el)
          }

          let children = this.elements.icons.slice(start)
          let sect = this.getElementForSection({iconset, children})
          this.elements.sections.push(sect)
        }

        return this.elements
      })
    this.fetch.done(
      children => {
        console.log(this)

        let { item } = modal, el
        this.item = item.parentElement
        el = this.item
        modal.item = el

        el.removeChild(item)
        let comp = render( this,render(children), el )
        console.log(comp);

    })
  }

  getElementForSection ({iconset, children}) {
    return (
      <section
        className={'icon-picker-set iconset ' + iconset}
        key={iconset}>
        <h3>{iconset}</h3>
        {children}
      </section>
    )
  }

  getElementForIcon (props) {
    return <Icon key={props.icon} {...props} />
  }

  render ({sections}) {
    console.log(IconPicker);
    let res = (
      <IconPicker>
        {sections}
      </IconPicker>
    )
    console.log(res);
    return res
  }
}


export default class IconPicker extends Component {

  constructor(props) {
    super(props)
    console.log(this);
  }

  render () {
    let { children } = this.props
    let style = {
      height: 'auto',
      maxHeight: '60vh',
      overflow: 'auto',
      padding: '3.6rem 0',
    }
    console.log(this);
    return (
      <div className='icon-picker'>
        <header>

        </header>
        <main
          style={style}>
          {children}
        </main>
        <footer className='btn-toolbar'>
          <Button type='error'>
            <Icon iconset='ion' icon='ios-arrow-right' />
            Cancel
          </Button>
        </footer>
      </div>
    )
  }
}


export const showModal = () => {
  let item = document.createElement('div')
  let modal = atom.workspace.addModalPanel({item})
  let adapter = new IconPreviewAdapter(modal)

  let hideModal = () => {
    modal.hide()
    document.removeEventListener('click', hideModal) }
  document.addEventListener('click', hideModal)
}
