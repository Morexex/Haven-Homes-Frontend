<script setup lang="ts">
import { ref } from "vue";
import apiClient from '@/services/apiClient'
import { useRouter } from 'vue-router'
import { AxiosError } from 'axios';
import { useToast } from "vue-toastification";
const form = ref({
  email: "",
  password: "",
  property_code: ""
});
const isLoading = ref(false);
const alertActive = ref(false);
const router = useRouter()
const toast = useToast()

const handleSubmit = async () => {
  if (
    !form.value.property_code ||
    !form.value.email ||
    !form.value.password
  ) {
    toast.warning('Please fill in all fields.', {
      timeout: 3000,
    });
    return;
  }

  isLoading.value = true;

  try {
    const response = await apiClient.post('/login', form.value);
    const { token, user } = response.data;

    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));

    toast.success('Login Succesfull!.', {
      timeout: 3000,
    });

    // Redirect to Dashboard after successful login
    router.push({ name: 'home' });
  } catch (error) {
    if (error instanceof AxiosError && error.response && error.response.status === 401) {
      toast.error('Invalid Credentials.', {
      timeout: 3000,
    });
    } else {
      toast.error('An error occured.', {
      timeout: 3000,
    });
    }

    alertActive.value = true; // ✅ Keep this outside `finally`
  } finally {
    isLoading.value = false; // ✅ Only stop loading, don't hide the alert
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
        <v-sheet class="bg-green-500 pa-4 d-flex " width="500" style="height: 600px;" color="green" :elevation="17">
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
              <br><br>
              <v-card-action style="width: auto; float: right;">
                <span>dont have an account? </span>
                <router-link to="/register"
                  style="color: green; text-decoration: underline; z-index: 2;">register</router-link>
              </v-card-action>
            </v-form>
          </v-card-item>
        </v-col>
      </v-row>
      <v-img src="/assets/images/home.png" class="mx-auto" max-width="100%" height="300"
        style="margin-top: -300px; z-index: 1; position: relative;"></v-img>
    </v-card>
  </v-container>
</template>
