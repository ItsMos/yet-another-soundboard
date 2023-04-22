import { defineStore } from 'pinia'
import { sounds } from './sounds'

const audio = new Audio()
audio.oncanplay = audio.play
audio.volume = 0.25

export const useStore = defineStore('store', {
  state: () => {
    return {
      playing: false as boolean | string,
      outputDevice: '',
      sounds,
      soundPlaying: '',
      src: '',
      audio
    }
  },

  actions: {
    play(src: string) {
      if (this.src !== src) {
        this.src = src
        this.audio.src = src
      }

      if (this.src === src && this.audio.readyState > 2) {
        this.audio.currentTime = 0
        this.audio.play()
      }
    }
  }
})
