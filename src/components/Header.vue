<template>
<header class="fixed w-[100%] top-5 flex">
  <button class="ml-5 bg-sky-200 rounded-sm px-2 py-1"
    data-settingsBtn="true"
    @click="store.settings = !store.settings"
  >⚙</button>
  <div class="w-96 mx-auto relative">
    <i class="absolute ml-2 mt-1">🔍</i>
    <input
      ref="searchEl"
      v-model.trim="store.search"
      @keypress.enter="playFromSearch"
      placeholder="Search ..."
      class="w-[100%] h-8 pl-10 rounded-sm
      bg-gray-400 text-black
      "
    />
  </div>
</header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from '../store'
const store = useStore()

function playFromSearch() {
  store.filteredSounds?.[0]?.play()
}

const searchEl = ref()
// @ts-ignore
window.api.handleFocus(() => {
  searchEl.value.focus()
  searchEl.value.select()
})
</script>
