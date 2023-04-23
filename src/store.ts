import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSounds } from './sounds'

const audio = new Audio()
audio.oncanplay = audio.play
audio.volume = 0.25

const audio2 = new Audio()
audio2.oncanplay = audio2.play
audio2.volume = 0.25

export const useStore = defineStore('store', () => {
  const outputDevice = ref('')
  const sounds = ref<any[]>([])
  const playing = ref('')

  getSounds().then(_sounds => sounds.value = _sounds)

  function play(name: string) {
    if (playing.value !== name) {
      playing.value = name
      audio.src = sounds.value.find(s => s.name === name)?.path || ''
      audio2.src = sounds.value.find(s => s.name === name)?.path || ''
    }

    if (playing.value === name && audio.readyState > 2) {
      audio.currentTime = 0
      audio.play()
      audio2.currentTime = 0
      audio2.play()
    }
  }
  return { outputDevice, playing, sounds, play, audio, audio2 }
})
