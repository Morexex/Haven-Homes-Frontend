<template>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Add Room</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field v-model="room.label" label="Room Label" required></v-text-field>
            <v-text-field v-model="room.quantity" label="Quantity" type="number" required></v-text-field>
            <v-text-field v-model="room.floor" label="Floor Number" type="number"></v-text-field>
            <v-select 
              v-model="room.category_id" 
              label="Room Category" 
              :items="categories" 
              item-title="label" 
              item-value="id"
              required
            ></v-select>
            <v-switch v-model="room.is_vacant" label="Is Vacant?"></v-switch>
            <v-textarea v-model="room.description" label="Description"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="dialog = false">Cancel</v-btn>
          <v-btn color="green" :loading="loading" @click="submitRoom">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch, onMounted } from "vue";
  import apiClient from "@/services/apiClient";
  
  export default defineComponent({
    props: {
      modelValue: Boolean,
    },
    emits: ["update:modelValue", "room-added"],
    setup(props, { emit }) {
      const dialog = ref(props.modelValue);
      const valid = ref(false);
      const room = ref({
        label: "",
        is_vacant: false,
        description: "",
        category_id: null,
        quantity: 1,
        floor: null,
      });
      const loading = ref(false);
      const categories = ref([]);
  
      watch(() => props.modelValue, (newValue) => {
        dialog.value = newValue;
      });
  
      const fetchCategories = async () => {
        try {
          const response = await apiClient.get("/room-categories");
          categories.value = response.data;
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };
  
      const submitRoom = async () => {
        if (!valid.value) return;
        loading.value = true;
        try {
          await apiClient.post("/rooms", room.value);
          emit("room-added");
          emit("update:modelValue", false);
        } catch (error) {
          console.error("Error adding room:", error);
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(fetchCategories);
  
      return { dialog, valid, room, categories, submitRoom, loading };
    },
  });
  </script>
  