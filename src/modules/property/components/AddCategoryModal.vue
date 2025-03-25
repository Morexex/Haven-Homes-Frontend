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
        <v-btn color="red" @click="closeDialog">Cancel</v-btn>
        <v-btn color="green" :loading="loading" @click="submitForm" variant="outlined">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "vue-toastification";

const emit = defineEmits(["update:modelValue", "category-added", "category-updated"]);
const props = defineProps<{ modelValue: boolean; category?: any }>();
const toast = useToast();
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm(); // Reset form when closing modal
    emit("update:modelValue", value);
  },
});

const loading = ref(false);
const authStore = useAuthStore();
const defaultFormData = () => ({
  id: null,
  label: "",
  description: "",
});
const formData = ref(defaultFormData());
// Watch for changes and prefill the form
watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      formData.value = {
        ...newCategory,
      };
    } else {
      formData.value = defaultFormData();
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    loading.value = true;
    if (formData.value.id) {
      // Update existing room
      await apiClient.put(`/room-categories/${formData.value.id}`, formData.value, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Category updated successfully!");
      emit("category-updated");
    } else {
      // Create new room
      await apiClient.post("/room-categories", formData.value, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Category added successfully!");
      emit("category-added");
    }

    closeDialog();
  } catch (error) {
    console.error("Failed to create category", error);
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  resetForm();
  emit("update:modelValue", false);
};

const resetForm = () => {
  formData.value = defaultFormData();
};
</script>
