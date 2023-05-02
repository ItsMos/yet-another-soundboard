<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useStore } from './store'
// @ts-ignore
// import { recorder } from './record'
const store = useStore()
const devices = ref(<MediaDeviceInfo[]>[])

function play(name: string) {
  store.play(name)
}

const input = ref()
function changeOutputDevice() {  
  store.outputDevice = input.value
  // @ts-ignore
  store.audio.setSinkId(input.value)
}

const search = ref('')
const sounds = computed(() => {
  return store.searchSounds(search.value)
})

function playFromSearch() {
  play(sounds.value[0].name)
}

// @ts-ignore
window.api.handlePlayBind((event, partOfName) => {
  partOfName = partOfName.toLowerCase()
  const sound = store.findSoundByName(partOfName)
  if (sound) {
    console.log('c> playing from bind: '+ sound.name)
    play(sound.name)
  }
})

// @ts-ignore
window.api.handleStopBind(() => store.stop())

// @ts-ignore
// console.log(window.api.newBind('F2', 'laughter'))s

const searchEl = ref()
onMounted(async () => {
  const devs = await navigator.mediaDevices.enumerateDevices()
  devices.value = devs.filter(d => d.kind == 'audiooutput')
  input.value = devices.value.find(dev => dev.label.includes('CABLE Input'))?.deviceId
  changeOutputDevice()

  // @ts-ignore
  window.api.handleFocus(() => {
    searchEl.value.focus()
    searchEl.value.select()
  })
})

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
</script>

<template>
  <div class="w-[50%] mx-auto my-10 relative">
    <i class="absolute ml-2 mt-1">🔍</i>
    <input
      ref="searchEl"
      v-model.trim="search"
      @keypress.enter="playFromSearch"
      placeholder="Search ..."
      class="w-[100%] h-8 pl-10 rounded-sm
       bg-gray-400 text-black
      "
    />
  </div>
  <div class="mt-10 flex flex-wrap">
    <div
      v-for="sound in sounds"
      :key="sound.name"
      class="bg-slate-500
        w-52 p-5 m-5 rounded-sm
        text-center cursor-pointer
        flex-grow
      "
      @click="play(sound.name)"
    >
      {{ sound.name }}
    </div>
  </div>

  <br/>
  <select class="bg-gray-400" v-model="input" @change="changeOutputDevice">
    <option
      v-for="device in devices" :key="device.kind+device.deviceId" :value="device.deviceId">
      {{ device.label }}
    </option>
  </select>
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
