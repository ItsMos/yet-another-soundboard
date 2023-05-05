<template>
  <aside
    ref="settingsPanel"
    :class='[
      "dark:bg-gray-800 bg-gray-400 h-screen w-56 px-5 fixed top-0 text-center transition-all",
      settings? "visible opacity-100 left-0" : "invisible -left-56 opacity-0"
    ]'
  >
    <h3 class="border-b pt-2 pb-1 -mx-5 mb-5">Settings</h3>

    <h4>Virtual Input</h4>
    <div class="bg-gray-700 rounded-sm py-2 px-1 mt-1 text-sm text-ellipsis whitespace-nowrap overflow-hidden">
      <template v-if="outputDevice">
        🎤 {{ outputDeviceLabel }}
      </template>
      <template v-else>
        🎤 Not Found <a href="#" class="text-fuchsia-300" @click="findOutPutDevice">(Refresh)</a>
      </template>
    </div>
    <a href="#" class="text-fuchsia-300">Open Devices</a>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '../store'
import { storeToRefs } from 'pinia'
const store = useStore()
const { settings, outputDevice } = storeToRefs(store)

function changeOutputDevice(deviceId: string) {
  outputDevice.value = deviceId
  // @ts-ignore
  store.audio.setSinkId(deviceId)
}

const outputDeviceLabel = ref('')
async function findOutPutDevice() {
  const devices = (await navigator.mediaDevices.enumerateDevices())
    .filter(d => d.kind == 'audiooutput')
  const device = devices.find(dev => dev.label.includes('CABLE Input'))
  if (device) {
    changeOutputDevice(device.deviceId)
    outputDeviceLabel.value = device.label
  }
}

onMounted(findOutPutDevice)

const settingsPanel = ref()
addEventListener('click', ev => {
  // @ts-ignore
  if (ev.target?.dataset?.settingsbtn) return

  if (!(settingsPanel.value === ev.target || settingsPanel.value.contains(ev.target))) {
    settings.value = false
  }
})
</script>
