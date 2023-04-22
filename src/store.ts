import { defineStore } from 'pinia'
import { sounds } from './sounds'

const audio = new Audio()
audio.oncanplay = audio.play
audio.volume = 0.25

const audio2 = new Audio()
audio2.oncanplay = audio2.play
audio2.volume = 0.25

export const useStore = defineStore('store', {
  state: () => {
    return {
      outputDevice: '',
      sounds,
      src: '',
      audio,
      audio2
    }
  },

  actions: {
    play(src: string) {
      if (this.src !== src) {
        this.src = src
        this.audio.src = src
        this.audio2.src = src
      }

      if (this.src === src && this.audio.readyState > 2) {
        this.audio.currentTime = 0
        this.audio.play()
        this.audio2.currentTime = 0
        this.audio2.play()
      }
    }
  }
})
