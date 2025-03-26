<template>
    <v-container fluid class="body-view" elevation-11>
        <!-- Dynamic content injected here -->
        <slot></slot>
    </v-container>
</template>

<script setup>
</script>

<style scoped>
.body-view {
    border-radius: 15px;
    margin-top: 70px;
    padding: 5px;  /* Custom padding */
    box-shadow: 0 4px 8px rgba(1, 0, 0, 0.3);  /* Optional: Add shadow for a card-like effect */
    width: calc(100vw - 190px);
    margin-left: 155px;
    margin-bottom: 40px;
    min-height: 80vh;
    max-height: auto;
  }
  </style>