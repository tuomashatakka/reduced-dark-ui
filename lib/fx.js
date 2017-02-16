'use babel'

export function curtainify (hide=false) {
  let body                = document.body.children[0]
  let trans               = hide ? 'none' : "opacity .5s, blur .29s"
  body.style.opacity      = hide ? 0 : 1
  body.style.webkitFilter = hide ? "blur(24px)" : "blur(0px)"
  body.style.transition   = trans

  if (!hide) {
    body.style.animationPlayState = "running";
  }
  if (hide) {
    setTimeout(() => document.body.setAttribute('theme-active', true), 800)
  }
}
