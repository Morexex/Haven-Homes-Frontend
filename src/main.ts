import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import Toast from "vue-toastification";
import type { PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";
import simpleBarDirective from "@/directives/simpleBar.ts";

import App from './App.vue';
import router from './router';

// Vuetify styles & dependencies
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import 'simplebar/dist/simplebar.css';
import 'vue-toastification/dist/index.css';

import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Define Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
});

// Define Toast options
const options: PluginOptions = {
  position: 'top-right' as any,
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  icon: true,
};

// Create Vue app
const app = createApp(App);

app.directive("simplebar", simpleBarDirective);
app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(Toast, options); // Apply Toast with options

app.mount('#app');
