<template>
  <v-app>
    <!-- Sidebar -->
    <SideBar v-if="!hideSidebar" />

    <!-- Main Content -->
    <MainBody>
      <router-view />
    </MainBody>
    <TopBar />

    <!-- Footer -->
    <Footer />
  </v-app>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import SideBar from './SideBar.vue';
import TopBar from './TopBar.vue';
import Footer from './Footer.vue';
import MainBody from './MainBody.vue'

const route = useRoute();
const hideSidebar = ref(false);

// Watch for changes in the route path and update hideSidebar dynamically
watchEffect(() => {
  hideSidebar.value = ["/", "/login", "/register"].includes(route.path);
});
</script>
