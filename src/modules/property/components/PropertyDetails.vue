<template>
  <v-container>
    <!-- Top Bar with Cancel Icon -->
    <v-row justify="space-between" align="center" class="mb-4">
      <v-col cols="10">
        <h2>Property Details</h2>
      </v-col>
      <v-col cols="2" class="text-right">
        <v-btn icon size="small" @click="goBack">
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Logo & Property Info -->
    <v-row>
      <v-col cols="2">
        <v-card class="mx-auto" rounded="0">
          <v-avatar color="grey" rounded="0" size="180">
            <!-- Shimmer Effect for Logo -->
            <v-skeleton-loader v-if="loading" type="image" />
            <v-img v-else-if="logoImage" :src="logoImage.image_url" cover></v-img>
            <v-img v-else src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg" cover></v-img>
          </v-avatar>

          <!-- Shimmer Effect for Property Name & Address -->
          <v-list-item v-if="loading">
            <v-skeleton-loader type="heading, text" />
          </v-list-item>
          <v-list-item v-else :subtitle="propertyDetails?.property_address"
            :title="propertyDetails?.property_name"></v-list-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="12" class="text-right">
        <v-btn color="green" @click="UploadPropertyImages" :loading="loading">Manage Photos</v-btn>
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>
    <h2 class="text-h5 font-weight-bold">Property Images</h2>

    <!-- Images Section -->
    <v-row v-if="loading">
      <!-- Shimmer for Images -->
      <v-col v-for="i in 3" :key="i" cols="4">
        <v-skeleton-loader type="image, text" />
      </v-col>
    </v-row>

    <v-row v-else-if="filteredImages.length">
      <v-col v-for="(image, index) in filteredImages" :key="index" cols="4">
        <v-card class="pa-2 image-card" @mouseenter="hoveredImageId = image.id" @mouseleave="hoveredImageId = null">
          <v-img :src="image.image_url" aspect-ratio="1" class="rounded-lg" cover></v-img>
          <v-card-subtitle class="d-flex justify-center mt-2">
            <v-chip color="blue" text-color="white">{{ formatTag(image.tag) }}</v-chip>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <p v-else>No images uploaded yet.</p>
  </v-container>
</template>

<script lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";

interface PropertyImage {
  id: number;
  image_url: string;
  tag: string;
}

export default {
  name: "PropertyDetails",
  setup() {
    const toast = useToast();
    const router = useRouter();
    const loading = ref(false);
    const propertyDetails = ref<any>(null);
    const propertyImages = ref<PropertyImage[]>([]);
    const hoveredImageId = ref<number | null>(null);
    const authStore = useAuthStore();

    // Fetch property details
    const fetchPropertyDetails = async () => {
      loading.value = true;
      if (!authStore.propertyCode) {
        console.error("Property Code is missing!");
        loading.value = false;
        return;
      }

      try {
        const property_code = authStore.propertyCode;
        const response = await apiClient.get(`/properties/${property_code}`);
        propertyDetails.value = response.data;

        // Fetch images after property details are retrieved
        await fetchPropertyImages();
      } catch (error) {
        console.error("Error fetching property details:", error);
        toast.error("Failed to load property details.");
      } finally {
        loading.value = false;
      }
    };

    // Fetch property images
    const fetchPropertyImages = async () => {
      const propertyId = propertyDetails.value?.id;
      if (!propertyId) {
        console.error("Property ID is missing!");
        return;
      }

      try {
        const response = await apiClient.get(`/properties/${propertyId}/images`);
        propertyImages.value = response.data.images;
      } catch (error) {
        console.error("Failed to fetch images:", error);
        toast.error("Failed to load property images.");
      }
    };

    const UploadPropertyImages = () => {
      if (!propertyDetails.value?.id) {
        toast.error("❌ Property ID is missing. Cannot navigate.");
        return;
      }
      router.push({
        name: "ManagePropertyImages",
        params: { id: propertyDetails.value.id },
      });
    };

    const goBack = () => {
      router.back();
    };

    // Get logo image
    const logoImage = computed(() =>
      propertyImages.value.find((img) => img.tag.toLowerCase() === "logo")
    );

    // Filter out logo images
    const filteredImages = computed(() =>
      propertyImages.value.filter((img) => img.tag.toLowerCase() !== "logo")
    );

    // Format tag for display
    const formatTag = (tag: string) => {
      return tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, " ");
    };

    onMounted(() => {
      fetchPropertyDetails();
    });

    return {
      loading,
      propertyDetails,
      UploadPropertyImages,
      propertyImages,
      logoImage,
      filteredImages,
      hoveredImageId,
      formatTag,
      goBack,
    };
  },
};
</script>

<style scoped>
.image-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-card:hover {
  transform: scale(1.05);
}

.image-card:hover .edit-button {
  opacity: 1;
}

.v-chip {
  font-weight: bold;
  text-transform: capitalize;
  font-size: 0.85rem;
}
</style>
