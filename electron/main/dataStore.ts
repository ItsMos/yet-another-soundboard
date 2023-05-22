import electron from 'electron'
import path from 'path'
import fs from 'fs'

const config = {
  fileName: 'data.json',
  default: {keybinds: {}, favorites: []}
}

export class Store {
  path: string
  data: object

  constructor() {
    const userDataPath = electron.app.getPath('userData')
    this.path = path.join(userDataPath, config.fileName)
    this.data = parseDataFile(this.path, config.default)
  }

  // This will just return the property on the `data` object
  get(key) {
    return this.data[key]
  }

  // ...and this will set it
  set(key, val) {
    this.data[key] = val
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    fs.writeFileSync(this.path, JSON.stringify(this.data))
  }
}

function parseDataFile(filePath, defaults): object {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch(error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults
  }
}
