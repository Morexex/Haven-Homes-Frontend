<template>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Add Room Category</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="formData.label" label="Category Name" required variant="outlined"></v-text-field>
            <v-textarea v-model="formData.description" label="Description" variant="outlined"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" @click="closeModal" variant="outlined">Cancel</v-btn>
          <v-btn color="green" :loading="loading" @click="submitForm" variant="outlined">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from "vue";
  import apiClient from "@/services/apiClient";
  
  export default defineComponent({
    props: {
      dialog: Boolean,
    },
    emits: ["update:dialog", "category-added"],
    setup(props, { emit }) {
      const loading = ref(false);
      const formData = ref({
        label: "",
        description: "",
      });
  
      const closeModal = () => {
        emit("update:dialog", false);
      };
  
      const submitForm = async () => {
        try {
          loading.value = true;
          const response = await apiClient.post("/room-categories", formData.value);
          emit("category-added", response.data.category); // Send data back to parent
          closeModal();
        } catch (error) {
          console.error("Failed to create category", error);
        } finally {
          loading.value = false;
        }
      };
  
      return {
        formData,
        loading,
        closeModal,
        submitForm,
      };
    },
  });
  </script>
  