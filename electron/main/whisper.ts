import path from 'path'
const { whisper } = require(path.join(
  process.env.PUBLIC,
  "./bin/whisper-addon"
))
import { promisify } from 'util'

export const whisperAsync = promisify(whisper)

export const whisperParams = {
  language: "en",
  model: path.join(process.env.PUBLIC, "./bin/ggml-tiny.en.bin"),
  fname_inp: path.join(process.env.PUBLIC, "jfk.wav")
}

// console.log("whisperParams =", whisperParams)

// whisperAsync(whisperParams).then((result) => {
//   console.log(`Result from whisper: ${result}`)
// })
