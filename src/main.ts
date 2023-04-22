import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import "./style.css"
// import './samples/node-api'

createApp(App)
  .use(createPinia())
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
