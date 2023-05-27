<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from './store'
import AppHeader from './components/Header.vue'
import Settings from './components/Settings.vue'
import { Sound } from './sounds'
// @ts-ignore
// import { recorder } from './record'
const store = useStore()

function play(name: string) {
  store.playByName(name)
}

const sounds = computed(() => {
  return store.filteredSounds.sort((a,b) => a.favorite? -1 : 0)
})

// @ts-ignore
window.api.handlePlayBind((event, partOfName) => {
  // partOfName = partOfName.toLowerCase()
  console.log('c> playing from bind: '+ partOfName)
  play(partOfName)
})

// @ts-ignore
window.api.handleStopBind(() => store.stop())

// @ts-ignore
// console.log(window.api.newBind('F2', 'laughter'))s

// let recording = false
/* async function startRecording() {
  if (recording) return
  recording = true
  console.log('> recording')

  recorder.start()
  setTimeout(() => {
    recorder.stop(async (data: any) => {
      console.log('> stopped recording')
      const exportedBlob = data

      let reader = new FileReader()
      reader.onload = function() {
        if (reader.readyState == 2) {
          let buffer = reader.result            
          // @ts-ignore
          window.api.saveMicAudio(buffer)
          recording = false
        }
      }
      reader.readAsArrayBuffer(exportedBlob)
    })
  }, 2000)
} */
// @ts-ignore
// window.api.handleCaptureMicAudio(startRecording)

function fav(sound: Sound) {
  sound.favorite = !sound.favorite
  // @ts-ignore
  window.api.fav(sound.name, sound.favorite)
}

const listeningToBind = ref('')
const listener = (ev: KeyboardEvent) => {
  ev.preventDefault()

  if (['Shift', 'Alt', 'Control'].includes(ev.key)) {
    return
  }

  const sound = sounds.value.find(s => s.name === listeningToBind.value)

  if (ev.key === 'Escape') {
    window.removeEventListener('keyup', listener)
    if (sound) {
      // @ts-ignore
      window.api.removeBind(sound.bind)
      sound.bind = ''
    }
    listeningToBind.value = ''
    return
  }

  let keys = ''
  if (ev.ctrlKey) keys += 'Control+'
  if (ev.altKey) keys += 'Alt+'
  if (ev.shiftKey) keys += 'Shift+'
  keys += ev.key
  // console.log(keys, '=>', listeningToBind.value)

  if (sound) {
    sound.bind = keys
    // @ts-ignore
    window.api.newBind(keys, sound.name).then(bound => {
      console.log(bound)
    })
  }
  // console.log(ev)
  window.removeEventListener('keyup', listener)
  listeningToBind.value = ''
}

function listenToBind(soundName: string) {
  if (listeningToBind.value) {
    window.removeEventListener('keyup', listener)
  }
  listeningToBind.value = soundName
  window.addEventListener('keyup', listener)
}

function genColor (seed: number) {
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

function getForeground(bgColor: string, lightColor: string, darkColor: string) {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ? darkColor : lightColor
}
</script>

<template>
  <AppHeader/>

  <div class="mt-14 flex flex-wrap">
    <div
      v-for="sound in sounds"
      :key="sound.name"
      :style="{
        background: '#' + genColor(getSeed(sound.name)),
        color: getForeground(genColor(getSeed(sound.name)), '#fff', '#111')
      }"
      class="
        w-52 p-5 m-5 rounded-sm
        text-center cursor-pointer
        flex-grow
        relative group
      "
      @click="play(sound.name)"
    >
      {{ sound.name }}

      <button
        title="Favorite this sound"
        :class="[
          'rounded-sm px-1 absolute bottom-1 right-1 group-hover:visible',
          sound.favorite ? 'visible' : 'invisible'
        ]"
        @click.stop="fav(sound)"
      >
        ⭐
      </button>

      <div
        :class="[
          listeningToBind == sound.name || sound.bind ? '' : 'invisible',
          'w-[100%] absolute left-0 top-[100%] flex justify-center group-hover:visible'
        ]"
        @click.stop="listenToBind(sound.name)"
      >
        <div class="bg-gray-700 ml-2 mt-1 px-2 rounded-sm text-sm text-ellipsis whitespace-nowrap overflow-hidden h-5">
          {{ sound.bind || 'click to add keybind' }}
        </div>
      </div>
    </div>
  </div>

  <Settings/>
</template>

<style scoped>
/* .logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
} */
</style>
