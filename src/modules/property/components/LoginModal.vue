<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Login to Property</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="form.property_code"
            label="Property Code"
            disabled
            variant="outlined"
          />
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            required
            variant="outlined"
          />
          <v-text-field
            v-model="form.password"
            label="Password"
            type="password"
            required
            variant="outlined"
          />
          <v-btn type="submit" color="#F2994A" block class="mt-3">Login</v-btn>
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

export default {
  props: {
    modelValue: Boolean,
    property: Object, // Property data passed from parent component
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const toast = useToast();
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

        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Login successful", { timeout: 2000 });
        emit("update:modelValue", false);

        // Debug property ID before navigating
        console.log("Navigating to property ID:", props.property?.id);

        if (props.property?.id) {
          await router.push({ path: `/properties/view/${props.property.id}` });
        } else {
          console.error("Property ID is undefined. Cannot navigate.");
        }
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          toast.error(error.response.data.error || "Login failed", { timeout: 3000 });
          errorMessage.value = error.response.data.error || "Login failed.";
        } else {
          toast.error("An unexpected error occurred", { timeout: 3000 });
          console.log(error)
        }
      }
    };

    return { dialog, form, handleLogin, errorMessage };
  },
};
</script>
