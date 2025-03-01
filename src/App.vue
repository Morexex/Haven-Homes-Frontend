<template>
  <v-app>
    <v-main>
      <div v-simplebar class="app-scroll-container">z
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Ensure the main content is scrollable while keeping headers fixed */
.app-scroll-container {
  height: 100vh; /* Make it take full screen height */
  overflow-y: auto;
}
</style>
