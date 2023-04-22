<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useStore } from '../store'
const store = useStore()

const audio1 = ref()
const audio2 = ref()
// const audioSrc = ref('')
const audioSrc = computed(() => store.soundPlaying)

function onAudioReady(this: HTMLAudioElement) {
  console.log('readyState ' + this.readyState)
  if (store.playing && this.readyState >= 2)
    this.play()
}

onMounted(() => {
  audio1.value.volume = 0.25
  audio2.value.volume = 0.25  
  audio1.value.onloadeddata = onAudioReady
  audio2.value.onloadeddata = onAudioReady
})

watch(() => store.playing, (playing) => {
  console.log('playing', playing)
  console.log(audio1.value.readyState)
  
  if (playing && (audio1.value.readyState >=2 && audio2.value.readyState >=2)) {
    console.log('yes')
    
    audio1.value.play()
    audio2.value.play()
  }

  if (!playing) {
    audio1.value.pause()
    audio2.value.pause()
    audio1.value.currentTime = 0
    audio2.value.currentTime = 0
  }
})

// watch(() => store.soundPlaying, (src) => {
//   audioSrc.value = src
// })

watch(() => store.outputDevice, (outputDevice) => {
  console.log('outputDevice', outputDevice)
  audio1.value.setSinkId(outputDevice)
})

</script>

<template>
  <audio :src="audioSrc" @ended="store.playing = false" controls ref="audio1"></audio>
  <audio :src="audioSrc" controls ref="audio2"></audio>
</template>
