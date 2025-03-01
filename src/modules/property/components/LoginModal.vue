<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Login to Property</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field v-model="form.property_code" label="Property Code" disabled variant="outlined" />
          <v-text-field v-model="form.email" label="Email" type="email" required variant="outlined" />
          <v-text-field v-model="form.password" label="Password" type="password" required variant="outlined" />
          <v-btn type="submit" color="#F2994A" block class="mt-3">
            Login
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ref, computed, watch } from "vue";
import apiClient from "@/services/apiClient";
import router from "@/router";
import { useToast } from "vue-toastification";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore"; // Import Pinia store
import { nextTick } from "vue";

export default {
  props: {
    modelValue: Boolean,
    property: Object, // Property data passed from parent component
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const toast = useToast();
    const authStore = useAuthStore(); // Pinia Store
    const errorMessage = ref("");

    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const form = ref({
      property_code: props.property?.property_code || "",
      email: props.property?.owner_email || "",
      password: "",
    });

    // Watch for property changes
    watch(
      () => props.property,
      (newProperty) => {
        form.value.property_code = newProperty?.property_code || "";
        form.value.email = newProperty?.owner_email || "";
      },
      { immediate: true }
    );

    const handleLogin = async () => {
      errorMessage.value = "";

      try {
        const response = await apiClient.post("/login", form.value);
        const { token, user } = response.data;

        // ✅ Store token, user, and property_code in Pinia
        authStore.setAuthData(token, user, form.value.property_code);

        toast.success("Login successful", { timeout: 2000 });

        console.log("Waiting for session to update...");
        await nextTick();

        console.log("Checking session for:", form.value.property_code);
        console.log("Session data:", authStore.sessions);

        if (authStore.getSessionForProperty(form.value.property_code)) {
          console.log("✅ Session found! Navigating to property:", form.value.property_code);
          await router.push({
            name: "view-property",
            params: { property_code: form.value.property_code },
          });
        } else {
          console.error("❌ Session for property not found. Check `setAuthData()` in authStore.");
        }

        emit("update:modelValue", false); // Close modal after navigation
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          toast.error(error.response.data.error || "Login failed", { timeout: 3000 });
          errorMessage.value = error.response.data.error || "Login failed.";
        } else {
          toast.error("An unexpected error occurred", { timeout: 3000 });
          console.log(error);
        }
      }
    };



    return { dialog, form, handleLogin, errorMessage };
  },
};
</script>
