import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getSounds, Sound } from './sounds'

const audio = new Audio()
audio.oncanplay = audio.play
audio.volume = 0.70

const audio2 = new Audio()
audio2.oncanplay = audio2.play
audio2.volume = 0.70

export const useStore = defineStore('store', () => {
  const outputDevice = ref('')
  const sounds = ref<Sound[]>([])
  const playing = ref('')
  const search = ref('')
  const settings = ref(false)

  const favorites = ref({})

  getSounds().then(_sounds => {
    // @ts-ignore
    window.api.getData().then(data => {
      for (const bind in data.keybinds) {
        const soundName = data.keybinds[bind]
        const sound = _sounds.find(s => s.name === soundName)
        if (sound) {          
          sound.bind = bind
        }
      }
      sounds.value = _sounds

      favorites.value = data.favorites
    })
  })

  function play(sound: Sound) {
    if (playing.value !== sound.name) {
      playing.value = sound.name
      audio.src = sound.path
      audio2.src = sound.path
    }

    if (playing.value === sound.name && audio.readyState > 2) {
      audio.currentTime = 0
      audio.play()
      audio2.currentTime = 0
      audio2.play()
    }
  }

  function playByName(name: string) {
    const sound = findSoundByName(name)
    if (sound) {
      play(sound)
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

  const filteredSounds = computed(() => {
    let q = search.value.toLowerCase()
    return sounds.value.filter(
      s => s.name.toLowerCase().includes(q) || s.altnames?.some(str => str.includes(q))
    )
  })

  return { outputDevice, playing, sounds, play, playByName, stop, audio, audio2, findSoundByName, search, filteredSounds, settings, favorites }
})
