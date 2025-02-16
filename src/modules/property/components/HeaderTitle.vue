<template>
    <v-row class="align-center mb-4 pa-5">
      <!-- Title Section -->
      <v-col cols="12" md="4">
        <h2 class="text-h5 font-weight-bold">{{ title }}</h2>
      </v-col>
  
      <!-- Search Bar -->
      <v-col v-if="showSearch" cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          :label="searchPlaceholder"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          clearable
        ></v-text-field>
      </v-col>
  
      <!-- Dynamic Buttons -->
      <v-col v-if="buttons.length" cols="12" md="4" class="text-right">
        <v-btn
          v-for="(button, index) in buttons"
          :key="index"
          :color="button.color || 'primary'"
          class="ml-2"
          @click="emitButtonEvent(button.event)"
        >
          <v-icon left>mdi-{{ button.icon || 'plus' }}</v-icon>
          {{ button.text }}
        </v-btn>
      </v-col>
    </v-row>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from "vue";
  
  export default defineComponent({
    props: {
      title: {
        type: String,
        required: true,
      },
      searchPlaceholder: {
        type: String,
        default: "Search...",
      },
      showSearch: {
        type: Boolean,
        default: true,
      },
      buttons: {
        type: Array as () => { text: string; event: string; color?: string; icon?: string }[],
        default: () => [],
      },
    },
    emits: ["update:search", "button-click"],
    setup(props, { emit }) {
      const searchQuery = ref("");
  
      watch(searchQuery, (newVal) => {
        emit("update:search", newVal);
      });
  
      const emitButtonEvent = (eventName: string) => {
        emit("button-click", eventName);
      };
  
      return { searchQuery, emitButtonEvent };
    },
  });
  </script>
  