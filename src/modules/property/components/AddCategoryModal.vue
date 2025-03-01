<template>
  <v-dialog :model-value="dialog" max-width="500px">
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
        <v-btn color="green" :loading="loading" @click="submitForm" variant="outlined">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";

export default defineComponent({
  props: {
    dialog: Boolean,
  },
  emits: ["update:dialog", "category-added"],
  setup(props, { emit }) {
    const loading = ref(false);
    const authStore = useAuthStore();
    const formData = ref({
      label: "",
      description: "",
    });

    const dialog = computed({
      get: () => props.dialog,
      set: (value) => emit("update:dialog", value),
    });

    const submitForm = async () => {
      try {
        loading.value = true;
        const response = await apiClient.post("/room-categories", formData.value, {
          headers: {
            "Property-Code": authStore.propertyCode,
          },
        });

        // Emit category data to parent component to refresh list
        emit("category-added", response.data.category);

        // Close dialog after successful category creation
        emit("update:dialog", false);

        // Refresh the page to reflect the changes
        window.location.reload();  // This will reload the page
      } catch (error) {
        console.error("Failed to create category", error);
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      loading,
      submitForm,
      dialog,
    };
  },
});
</script>
