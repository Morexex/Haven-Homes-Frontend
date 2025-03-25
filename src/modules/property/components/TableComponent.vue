<template>
  <v-card>
    <v-card-title>{{ title }}</v-card-title>
    <v-table>
      <thead>
        <tr>
          <th v-for="header in headers" :key="header.value">
            {{ header.text }}
          </th>
          <th v-if="actions.length">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index">
          <td v-for="header in headers" :key="header.value">
            {{ item[header.value] }}
          </td>
          <td v-if="actions.length">
            <v-menu offset-y>
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="fancy-action-btn"
                  elevation="4"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="action in actions"
                  :key="action.name"
                  @click="action.handler(item)"
                >
                  <v-list-item-title>
                    <v-icon :color="action.color" class="mr-2">{{ action.icon }}</v-icon>
                    {{ action.name }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    headers: {
      type: Array as PropType<{ text: string; value: string }[]>,
      required: true,
    },
    items: {
      type: Array as PropType<Record<string, any>[]>,
      required: true,
    },
    actions: {
      type: Array as PropType<{ name: string; icon: string; color: string; handler: (item: any) => void }[]>,
      default: () => [],
    },
  },
});
</script>

<style scoped>
/* Fancy Action Button */
.fancy-action-btn {
  background: transparent; /* Primary color with 70% opacity */
  color: orange;
  border-radius: 10px; /* Rounded corners */
  width: 50px; /* Adjust width */
  height: 40px; /* Adjust height */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  border: 1px solid green;
}

/* Glow Effect on Hover */
.fancy-action-btn:hover {
  background: green;
  box-shadow: 0px 0px 15px rgba(0, 123, 255, 0.8);
  transform: scale(1.1);
}
</style>
