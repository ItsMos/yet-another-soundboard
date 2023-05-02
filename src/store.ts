import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSounds, Sound } from './sounds'

const audio = new Audio()
audio.oncanplay = audio.play
audio.volume = 0.40

const audio2 = new Audio()
audio2.oncanplay = audio2.play
audio2.volume = 0.40

export const useStore = defineStore('store', () => {
  const outputDevice = ref('')
  const sounds = ref<Sound[]>([])
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

  function stop() {
    playing.value = ''
    audio.src = ''
    audio2.src = ''
  }

  function findSoundByName(name: string): Sound | undefined {
    for (const sound of sounds.value) {
      if (sound.name.includes(name) || (sound.altnames && sound.altnames.includes(name))) {
        return sound
      }
    }
    return undefined
  }

  function searchSounds(q: string) {
    return sounds.value.filter(
      s => s.name.includes(q) || s.altnames?.includes(q)
    )
  }
  return { outputDevice, playing, sounds, play, stop, audio, audio2, findSoundByName, searchSounds }
})
