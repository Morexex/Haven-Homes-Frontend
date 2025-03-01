<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";

const form = ref({
  email: "",
  password: "",
  property_code: "",
});
const isLoading = ref(false);
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore(); // Pinia Store

const handleSubmit = async () => {
  if (!form.value.property_code || !form.value.email || !form.value.password) {
    toast.warning("Please fill in all fields.", { timeout: 3000 });
    return;
  }

  isLoading.value = true;

  try {
    const response = await apiClient.post("/login", form.value);
    const { token, user } = response.data;

    // Store in Pinia
    authStore.setAuthData(token, user, form.value.property_code);

    toast.success("Login Successful!", { timeout: 3000 });

    // ✅ Ensure redirectTo is always a string
    let redirectTo = router.currentRoute.value.query.redirect;
    if (Array.isArray(redirectTo)) {
      redirectTo = redirectTo[0]; // Take the first value if it's an array
    }

    router.push({ name: redirectTo || "dashboard" }); // Default to "home" if redirect is undefined
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>; // ✅ Define type
    const errorMessage = axiosError.response?.data?.message || "An error occurred.";

    if (axiosError.response?.status === 401) {
      toast.error("Invalid Credentials.", { timeout: 3000 });
    } else {
      toast.error(errorMessage, { timeout: 3000 }); // ✅ No more TypeScript error
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <v-container>
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular v-if="isLoading" color="white" indeterminate></v-progress-circular>
    </v-overlay>
    <v-card variant="outlined">
      <v-row justify="center">
        <v-sheet class="bg-green-500 pa-4 d-flex" width="500" style="height: 600px;" color="green" :elevation="17">
          <v-col>
            <v-img src="/assets/images/techhaven.png" class="mx-auto" max-width="80%" height="auto"
              style="margin-top: 30px; z-index: 1; position: relative;"></v-img>
            <h2 class="text-h4 mb-3">Haven Homes ...</h2>
            <h2 class="text-h5 mb-4">Simplify your real estate with tech</h2>
          </v-col>
        </v-sheet>
        <v-col>
          <v-card-title>Login</v-card-title>
          <v-card-item>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field variant="outlined" prepend-inner-icon="mdi-home-city" v-model="form.property_code"
                label="Apartment Code"></v-text-field>
              <v-text-field variant="outlined" prepend-inner-icon="mdi-mail" v-model="form.email"
                label="Email"></v-text-field>
              <v-text-field prepend-inner-icon="mdi-key" type="password" variant="outlined" v-model="form.password"
                label="Password"></v-text-field>
              <v-btn color="green" class="mt-2" type="submit" style="width: auto; float: right; z-index: 2;">
                Login
              </v-btn>
              <br /><br />
              <v-card-action style="width: auto; float: right;">
                <span>Don't have an account? </span>
                <router-link to="/register"
                  style="color: green; text-decoration: underline; z-index: 2;">Register</router-link>
              </v-card-action>
            </v-form>
          </v-card-item>
        </v-col>
      </v-row>
      <v-img src="/assets/images/home.png" class="mx-auto" max-width="100%" height="40vh"
        style="margin-top: -300px; z-index: 1; position: relative;"></v-img>
    </v-card>
  </v-container>
</template>
