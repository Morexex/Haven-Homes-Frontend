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
              <v-btn
                v-for="action in actions"
                :key="action.name"
                :color="action.color"
                small
                class="mr-2"
                variant="outlined"
                @click="action.handler(item)"
              >
                <v-icon>{{ action.icon }}</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </template>
  
  <script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue"; // Use 'import type' for PropType

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    headers: {
      type: Array as PropType<{ text: string; value: string }[]>, // Define as PropType
      required: true,
    },
    items: {
      type: Array as PropType<Record<string, any>[]>,
      required: true,
    },
    actions: {
      type: Array as PropType<
        { name: string; icon: string; color: string; handler: (item: any) => void }[]
      >,
      default: () => [],
    },
  },
});
</script>  