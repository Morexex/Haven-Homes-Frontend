<script lang="ts">
import apiClient from '@/services/apiClient'
import { useAppStore } from '@/stores/useAppStore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AxiosError } from 'axios';
import { useToast } from "vue-toastification";

export default {
  setup() {
    const router = useRouter()
    const appStore = useAppStore()
    const currentPage = ref(1)
    const totalPages = 3
    const toast = useToast()
    const formData = ref<{
      name: string;
      email: string;
      phone: string;
      property_name: string;
      property_address: string;
      kyc: File | null;
      password: string;
      password_confirmation: string;
    }>({
      name: '',
      email: '',
      phone: '',
      property_name: '',
      property_address: '',
      kyc: null, // Now explicitly allowed to be null
      password: '',
      password_confirmation: '',
    });
    const isLoading = ref(false)

    const nextPage = () => {
      if (currentPage.value < totalPages) {
        currentPage.value++
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const handleSubmit = async () => {
      // Handle form submission logic here
      if (
        !formData.value.name ||
        !formData.value.email ||
        !formData.value.phone ||
        !formData.value.property_name ||
        !formData.value.property_address ||
        !formData.value.password ||
        !formData.value.password_confirmation
      ) {
        toast.warning("Please fill in all fields.!", {
            timeout: 3000,
        });
        return
      }

      isLoading.value = true;
      try {
        const response = await apiClient.post('/register', formData.value)
        toast.success(response.data.message || 'Registration successful!', {
            timeout: 3000,
        });
        // Reset form data
        formData.value = {
          name: '',
          email: '',
          phone: '',
          property_name: '',
          property_address: '',
          kyc: null,
          password: '',
          password_confirmation: '',
        }
        // Navigate to the sign-in page
        router.push({ name: 'login' })
      } catch (error: unknown) {
        // Handle backend error response
        let errorMessage = 'An error occurred';

        if (error instanceof AxiosError && error.response) {
          errorMessage = error.response.data?.error || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage, {
            timeout: 3000,
        });
      } finally {
        isLoading.value = false
      }
    }

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.files && target.files.length > 0) {
        formData.value.kyc = target.files[0];
      } else {
        formData.value.kyc = null;
      }
    };


    return {
      toggleEveryDisplay: appStore.toggleEveryDisplay,
      toggleHideConfig: appStore.toggleHideConfig,
      currentPage,
      totalPages,
      nextPage,
      prevPage,
      handleFileUpload,
      handleSubmit,
      formData,
      isLoading,
    }
  },
  created() {
    this.toggleEveryDisplay()
    this.toggleHideConfig()
  },
  beforeUnmount() {
    this.toggleEveryDisplay()
    this.toggleHideConfig()
  },
}
</script>

<template>
  <v-container>
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular v-if="isLoading" color="white" indeterminate></v-progress-circular>
    </v-overlay>
    <v-card variant="outlined">
      <v-row justify="center">
        <v-sheet class="bg-green-500 pa-4 d-flex " width="500" style="height: 600px;" color="orange" :elevation="17">
          <v-col>
            <v-img src="/assets/images/techhaven.png" class="mx-auto" max-width="80%" height="auto"
              style="margin-top: 30px; z-index: 1; position: relative;"></v-img>
            <h2 class="text-h4 mb-3">Haven Homes ...</h2>
            <h2 class="text-h5 mb-4">Simplify your real estate with tech</h2>
          </v-col>
        </v-sheet>
        <v-col>
          <v-card-title v-if="currentPage === 1">Admin Details</v-card-title>
          <v-card-title v-if="currentPage === 2">Property Details</v-card-title>
          <v-card-title v-if="currentPage === 3">Setup Password</v-card-title>
          <v-card-item>
            <v-form @submit.prevent="handleSubmit">
              <!-- Page 1 Fields -->
              <div v-if="currentPage === 1">
                <v-text-field variant="outlined" prepend-inner-icon="mdi-account" v-model="formData.name"
                  label="Full Names"></v-text-field>
                <v-text-field variant="outlined" prepend-inner-icon="mdi-mail" v-model="formData.email"
                  label="Email Address"></v-text-field>
                <v-text-field variant="outlined" prepend-inner-icon="mdi-phone" v-model="formData.phone"
                  label="Phone Number"></v-text-field>
              </div>
              <!-- Page 2 Fields -->
              <div v-if="currentPage === 2">
                <v-text-field variant="outlined" prepend-inner-icon="mdi-home-city" v-model="formData.property_name"
                  label="Property Name"></v-text-field>
                <v-text-field variant="outlined" prepend-inner-icon="mdi-map-marker-radius"
                  v-model="formData.property_address" label="Property Address"></v-text-field>
                <v-file-input label="KYC Upload" variant="outlined" @change="handleFileUpload"></v-file-input>
              </div>
              <!-- Page 3 Fields -->
              <div v-if="currentPage === 3">
                <v-text-field prepend-inner-icon="mdi-key" type="password" variant="outlined"
                  v-model="formData.password" label="Password"></v-text-field>
                <v-text-field prepend-inner-icon="mdi-key" type="password" variant="outlined"
                  v-model="formData.password_confirmation" label="Confirm Password"></v-text-field>
              </div>
              <!-- Navigation Buttons -->
              <div class="d-flex justify-content-between mt-3">
                <v-btn :disabled="currentPage === 1" @click="prevPage" variant="outlined" class="mt-2" type="button"
                  style="width: auto; float: right; z-index: 2; margin-left: 29.3vw; margin-right: 5vw;">
                  Previous
                </v-btn>
                <v-btn :disabled="currentPage === totalPages" @click="nextPage" color="orange-darken-2" class="mt-2"
                  type="button" style="width: auto; float: right; z-index: 2;">
                  Next
                </v-btn>
              </div>
              <div v-if="currentPage === totalPages" class="text-center mt-3">
                <v-btn color="orange" class="mt-2" type="submit" style="width: auto; float: right; z-index: 2;">
                  Register
                </v-btn>
              </div>
              <br><br>
              <v-card-action style="width: auto; float: right;">
                <span>Already have an account? </span>
                <router-link to="/login"
                  style="color: orange; text-decoration: underline; z-index: 20;">Login</router-link>
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
