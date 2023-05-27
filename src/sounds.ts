interface AltNames {
  [key: string]: string[];
}

import altnamesJson from './altnames.json'
const altnames: AltNames = altnamesJson
let store: any
import('./store').then(s => store = s.useStore())

export class Sound {
  name: string
  altnames?: string[]
  path: string
  favorite = false
  bind?: string
  bg: string
  color: string

  constructor(file: string, path: string) {
    this.name = file.replace(/\.mp3$/, '').replace(/-/g, ' ')
    this.path = path
    if (altnames[this.name])
      this.altnames = altnames[this.name]

    this.bg = '#' + genBg(getSeed(this.name))
    this.color = getColor(this.bg)
  }

  play() {
    store.play(this)
  }
}

export async function getSounds() {
  const files = await import.meta.glob('./assets/audio/*.mp3', { as: 'url' })
  const sounds: Sound[] = []
  for (const path in files) {
    const file = path.split('/').slice(-1)[0]
    sounds.push(new Sound(file, await files[path]()))
  }
  return sounds
}

function genBg (seed: number) {
  let color = Math.floor((Math.abs(Math.sin(seed) * 16777215))).toString(16)
  // pad any colors shorter than 6 characters with leading 0s
  while(color.length < 6) {
    color = '0' + color
  }

  return color
}

function getSeed(str: string) {
  let seed = 0
  str.split('').forEach(c => seed+= c.charCodeAt(0))
  return seed
}

function getColor(bgColor: string, lightColor = '#fff', darkColor = '#111') {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ? darkColor : lightColor
}
