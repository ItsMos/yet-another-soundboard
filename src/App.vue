<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from './store'
const store = useStore()
const devices = ref(<MediaDeviceInfo[]>[])

navigator.mediaDevices.enumerateDevices()
.then(devs => {
  devices.value = devs.filter(d => d.kind == 'audiooutput')
})

function play(path: string) {
  store.play(path)
}

const input = ref('')
function changeOutputDevice() {
  store.outputDevice = input.value
  // @ts-ignore
  store.audio.setSinkId(input.value)
}
</script>

<template>
  <div class="w-[50%] mx-auto my-10 relative">
    <i class="absolute ml-2 mt-1">🔍</i>
    <input placeholder="Search ..." type="text" class="w-[100%] h-8 pl-10 rounded-sm
      bg-gray-400 text-black
      "
    />
  </div>
  <div class="mt-10 flex flex-wrap">
    <div
      class="bg-slate-500
      w-52 p-5 m-5 rounded-sm
      text-center cursor-pointer
      flex-1
      "
      v-for="sound in store.sounds"
      @click="play(sound.path)"
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
