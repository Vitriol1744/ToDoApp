import './assets/main.css'

import Vue, { createApp } from 'vue'
// @ts-ignore
import App from './App.vue';
import VueCookies from 'vue-cookies';
import router from './router';
import 'vuetify/dist/vuetify.min.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App)

app.use(router)
app.use(VueCookies)
app.use(vuetify);

app.mount('#app')
