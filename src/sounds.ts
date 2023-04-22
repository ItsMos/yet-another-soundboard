class Sound {
  name: string
  path: string

  constructor(file: string, path: string) {
    this.name = file.replace(/\..*$/, '').replace(/-/g, ' ')
    this.path = path
  }
}

const files = import.meta.glob('./assets/audio/*.mp3', { as: 'url' })

export const sounds: Sound[] = []

for (const path in files) {
  const file = path.split('/').slice(-1)[0]
  sounds.push(new Sound(file, await files[path]()))
}
