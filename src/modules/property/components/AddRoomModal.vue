<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">{{ formData.id ? 'Edit Room' : 'Add Room' }}</v-card-title>

      <v-card-text v-simplebar style="max-height: 400px; overflow-y: auto;">
        <v-form ref="form">
          <v-text-field v-model="formData.label" label="Room Label" required variant="outlined"></v-text-field>

          <v-text-field v-model.number="formData.quantity" label="Quantity" type="number" required variant="outlined"
            @input="formData.quantity = Number(formData.quantity)"></v-text-field>

          <v-text-field v-model="formData.floor" label="Floor Number" variant="outlined"></v-text-field>

          <v-select v-model="formData.category_id" label="Room Category" :items="categories" item-title="label"
            item-value="id" required variant="outlined"></v-select>

          <v-switch v-model="formData.is_vacant" label="Is Vacant?" inset :color="formData.is_vacant ? 'green' : ''" />

          <v-textarea v-model="formData.description" label="Description" variant="outlined"></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn color="red" @click="closeDialog">Cancel</v-btn>
        <v-btn color="green" :loading="loading" @click="submitRoom">{{ formData.id ? 'Update' : 'Save' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "vue-toastification";

const props = defineProps<{ modelValue: boolean; room?: any }>();
const emit = defineEmits(["update:modelValue", "room-added", "room-updated"]);

const authStore = useAuthStore();
const toast = useToast();
const form = ref<HTMLFormElement | null>(null);
const loading = ref(false);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm(); // Reset form when closing modal
    emit("update:modelValue", value);
  },
});

const categories = ref<Array<{ id: number; label: string }>>([]);

const defaultFormData = () => ({
  id: null,
  label: "",
  is_vacant: true as boolean | null,
  description: "",
  category_id: null,
  quantity: 1 as number | string,
  floor: "",
});

const formData = ref(defaultFormData());

// Watch for changes and prefill the form
watch(
  () => props.room,
  (newRoom) => {
    if (newRoom) {
      formData.value = {
        ...newRoom,
        is_vacant: Boolean(newRoom.is_vacant),
      };
    } else {
      formData.value = defaultFormData();
    }
  },
  { immediate: true }
);

const fetchCategories = async () => {
  if (!authStore.propertyCode) {
    console.error("Property Code is missing!");
    return;
  }

  try {
    const response = await apiClient.get("/room-categories", {
      headers: { "Property-Code": authStore.propertyCode },
    });
    categories.value = response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    toast.error("Failed to load room categories.");
  }
};

const submitRoom = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  if (!authStore.propertyCode) {
    toast.error("Missing Property Code. Please try again.");
    return;
  }

  loading.value = true;

  try {
    if (formData.value.id) {
      // Update existing room
      await apiClient.put(`/rooms/${formData.value.id}`, formData.value, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Room updated successfully!");
      emit("room-updated");
    } else {
      // Create new room
      await apiClient.post("/rooms", formData.value, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Room added successfully!");
      emit("room-added");
    }

    closeDialog();
  } catch (error) {
    console.error("Error saving room:", error);
    toast.error("Failed to save room. Please try again.");
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

onMounted(fetchCategories);
</script>

<style scoped>
.image-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.v-card-text {
  max-height: 400px;
  overflow: hidden;
}

.v-card-text::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.v-card-text {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
