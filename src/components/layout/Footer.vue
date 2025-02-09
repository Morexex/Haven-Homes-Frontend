<template>
    <v-container fluid class="footer-view" elevation-11>
        <div class="px-4 py-2 text-center w-100">
            {{ new Date().getFullYear() }} — <strong>Powered by TechHaven</strong>
        </div>
    </v-container>
</template>

<script setup>
</script>

<style scoped>
.footer-view {
    border-radius: 10px;
    margin-top: 10px;
    padding: 5px;
    /* Custom padding */
    box-shadow: 0 4px 8px rgba(1, 0, 0, 0.3);
    /* Optional: Add shadow for a card-like effect */
    width: calc(100vw - 190px);
    margin-left: 155px;
    height: 30px;
    position: fixed;
    bottom: 0;
    left: 0;
}
</style>