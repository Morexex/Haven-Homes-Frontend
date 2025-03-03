<template>
    <v-container>
        <!-- Back Button -->
        <v-btn icon="mdi-arrow-right" @click="router.back()" class="mb-4" :disabled="loading">
            <v-icon size="20">mdi-close</v-icon>
        </v-btn>

        <v-card class="pa-5">
            <v-row>
                <v-col cols="12" md="6">
                    <!-- Shimmer Loading (Displays While Fetching) -->
                    <v-skeleton-loader v-if="loading" type="heading, text, text, text, chip" class="mb-4" />
                
                    <!-- Actual Room Details (Displayed Once Data is Loaded) -->
                    <template v-else>
                        <h2 class="text-h4 mb-2">{{ room?.label }}</h2>
                        <p><strong>Floor:</strong> {{ room?.floor }}</p>
                        <p><strong>Quantity:</strong> {{ room?.quantity }}</p>
                        <p><strong>Description:</strong> {{ room?.description }}</p>
                        <p>
                            <strong>Vacancy:</strong>
                            <v-chip :color="room?.is_vacant ? 'green' : 'red'">
                                {{ room?.is_vacant ? "Available" : "Occupied" }}
                            </v-chip>
                        </p>
                    </template>
                </v-col>                               
            </v-row>

            <v-col>
                <!-- Loading Indicator for Images -->
                <v-progress-circular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-5" size="50"></v-progress-circular>

                <!-- Show message when there are no images -->
                <v-alert v-else-if="roomImages.length === 0" type="info" class="text-center mt-4">
                    No images added for this room.
                </v-alert>

                <!-- Show carousel when images exist -->
                <v-carousel v-else :key="carouselKey">
                    <v-carousel-item v-for="image in roomImages" :key="image.id">
                        <v-img :src="image.image_url" height="700px" cover class="image-container">
                            <div class="image-tag" v-if="image.tag">
                                {{ image.tag }}
                            </div>
                        </v-img>
                    </v-carousel-item>
                </v-carousel>
            </v-col>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";

const route = useRoute();
const router = useRouter();
const room = ref<Room | null>(null);
const authStore = useAuthStore();
const roomImages = ref<RoomImage[]>([]);
const carouselKey = ref(0); // Used to refresh the carousel
const loading = ref(true); // Loading state

interface Room {
    id: number;
    label: string;
    floor: string;
    quantity: number;
    description: string;
    is_vacant: boolean;
}

interface RoomImage {
    id: number;
    image_url: string;
    tag?: string;
}

const fetchRoomDetails = async () => {
    loading.value = true; // Start loading

    try {
        const { data } = await apiClient.get(`/rooms/${route.params.id}`, {
            headers: { "Property-Code": authStore.propertyCode },
        });
        room.value = data;

        const imageResponse = await apiClient.get(`/rooms/${route.params.id}/images`, {
            headers: { "Property-Code": authStore.propertyCode },
        });
        roomImages.value = imageResponse.data.images || [];

        // Refresh carousel when images load
        carouselKey.value++;
    } catch (error) {
        console.error("Error fetching room details:", error);
    } finally {
        loading.value = false; // Stop loading
    }
};

// Watch for roomImages changes and refresh the carousel
watch(roomImages, () => {
    carouselKey.value++;
});

onMounted(fetchRoomDetails);
</script>

<style scoped>
.image-container {
    position: relative;
}

.image-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 6px 12px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
}
</style>