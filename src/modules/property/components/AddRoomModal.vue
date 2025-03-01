<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">Add Room</v-card-title>

      <!-- Apply SimpleBar to the scrollable section -->
      <v-card-text v-simplebar style="max-height: 400px; overflow-y: auto;">
        <v-form ref="form">
          <v-text-field v-model="room.label" label="Room Label" required variant="outlined"></v-text-field>

          <v-text-field v-model="room.quantity" label="Quantity" type="number" required
            variant="outlined"></v-text-field>

          <v-text-field v-model="room.floor" label="Floor Number" type="number" variant="outlined"></v-text-field>

          <v-select v-model="room.category_id" label="Room Category" :items="categories" item-title="label"
            item-value="id" required variant="outlined"></v-select>

          <v-switch v-model="room.is_vacant" label="Is Vacant?" inset :color="room.is_vacant ? 'green' : ''" />

          <v-textarea v-model="room.description" label="Description" variant="outlined"></v-textarea>
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
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "vue-toastification";

export default defineComponent({
  props: {
    modelValue: Boolean,
  },
  emits: ["update:modelValue", "room-added"],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const toast = useToast();
    const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
    const loading = ref(false);

    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const categories = ref<Array<{ id: number; label: string }>>([]);

    const room = ref({
      label: "",
      is_vacant: false,
      description: "",
      category_id: null,
      quantity: 1,
      floor: null,
    });

    const fetchCategories = async () => {
      console.log("Fetching categories with Property Code:", authStore.propertyCode);

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

      console.log("Submitting room with Property Code:", authStore.propertyCode);

      if (!authStore.propertyCode) {
        toast.error("Missing Property Code. Please try again.");
        return;
      }

      loading.value = true;
      try {
        await apiClient.post("/rooms", room.value, {
          headers: { "Property-Code": authStore.propertyCode },
        });

        toast.success("Room added successfully!");
        emit("room-added");
        emit("update:modelValue", false);
      } catch (error) {
        console.error("Error adding room:", error);
        toast.error("Failed to add room. Please try again.");
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchCategories);

    return { dialog, form, room, categories, submitRoom, loading };
  },
});
</script>

<style>
/*  Ensure SimpleBar's container hides the default scrollbar */
.v-card-text {
  max-height: 400px;
  overflow: hidden;
  /* Hide native scrollbar */
}

/* Hide default scrollbar */
.v-card-text::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.v-card-text {
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}
</style>
