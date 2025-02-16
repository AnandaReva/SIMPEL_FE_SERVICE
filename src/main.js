/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
/* import { registerPlugins } from '@/plugins'
import App from './App.vue'
import { createApp } from 'vue'
import router from './router/index'

const app = createApp(App)

registerPlugins(app)
app.use(router)
app.mount('#app') */



import { registerPlugins } from '@/plugins'
import App from './App.vue'
import { createApp } from 'vue'
import router from './router/index'
import '@mdi/font/css/materialdesignicons.css';
import CanvasJSChart from '@canvasjs/vue-charts';

const app = createApp(App)
registerPlugins(app)

app.use(CanvasJSChart);

app.use(router)
app.mount('#app')
