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

  constructor(file: string, path: string) {
    this.name = file.replace(/\..*$/, '').replace(/-/g, ' ')
    this.path = path
    if (altnames[this.name])
      this.altnames = altnames[this.name]
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
