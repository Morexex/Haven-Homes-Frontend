<template>
    <div>
        <!-- Header Component (Reusable) -->
        <HeaderTitle title="Vacancies" searchPlaceholder="Search Vacancies" showSearch
            @update:search="updateSearchQuery" />

        <v-row>
            <v-col v-for="room in filteredVacancies" :key="room.id" cols="12" md="4">
                <v-card class="property-card mx-auto" max-width="344" hover>
                    <v-card-item>
                        <v-card-title>{{ room.label }}</v-card-title>
                        <v-card-subtitle>{{ room.floor }}</v-card-subtitle>
                    </v-card-item>

                    <!-- Row to hold the image and room details side by side -->
                    <v-card-text>
                        <v-row align="center">
                            <!-- Image Column -->
                            <v-col cols="5">
                                <v-img
                                    :src="roomImages[room.id]?.[0] ? roomImages[room.id][0] : 'https://via.placeholder.com/150'"
                                    height="100" cover class="rounded-lg"></v-img>
                            </v-col>

                            <!-- Room Details Column -->
                            <v-col cols="7">
                                <div>No Of Rooms: {{ room.quantity }}</div>
                                <div v-if="room.is_vacant">
                                    <v-chip color="green" label>Vacant</v-chip>
                                </div>
                                <div v-else>
                                    <v-chip color="orange" label>Occupied</v-chip>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

    </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from "vue";
import apiClient from "@/services/apiClient";
import HeaderTitle from "../components/HeaderTitle.vue";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";

interface Room {
    id: number;
    label: string;
    floor: string;
    is_vacant: boolean;
    quantity: number;
}

export default {
    setup() {
        const rooms = ref<Room[]>([]);
        const searchQuery = ref("");
        const toast = useToast();
        const authStore = useAuthStore();
        const loading = ref(false);

        // Fetch Properties from API
        const fetchRooms = async () => {
            loading.value = true;
            if (!authStore.propertyCode) return;
            try {
                const { data } = await apiClient.get("/rooms", {
                    headers: { "Property-Code": authStore.propertyCode },
                });
                rooms.value = data;

                // Fetch images only after rooms are loaded
                for (const room of rooms.value) {
                    await fetchRoomImages(room.id);
                }
            } catch (error) {
                toast.error("Failed to load rooms.");
            } finally {
                loading.value = false;
            }
        };


        onMounted(() => {
            fetchRooms();
        });
        // Computed Room for Filtering Properties Based on Search
        const filteredVacancies = computed(() =>
            rooms.value.filter((room) =>
                room.label?.toLowerCase().includes(searchQuery.value.toLowerCase())
            )
        );

        //Fetch property images
        const roomImages = ref<Record<number, string[]>>({});

        const fetchRoomImages = async (roomId: number) => {
            try {
                const response = await apiClient.get(`/rooms/${roomId}/images`, {
                    headers: { "Property-Code": authStore.propertyCode },
                });

                if (Array.isArray(response.data.images) && response.data.images.length > 0) {
                    roomImages.value = { ...roomImages.value, [roomId]: response.data.images };
                } else {
                    console.warn(`No images found for room ${roomId}`);
                }
            } catch (error) {
                console.error("Failed to fetch images:", error);
                toast.error("Failed to load room images.");
            }
        };


        onMounted(() => {
            rooms.value.forEach(room => {
                fetchRoomImages(room.id);
            });
        });

        // Function to Update Search Query
        const updateSearchQuery = (query: string) => {
            searchQuery.value = query;
        };

        return {
            rooms,
            searchQuery,
            updateSearchQuery,
            filteredVacancies,
            roomImages,
        };
    },
};
</script>

<style scoped>
.property-card {
    border: 2px solid green;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.property-card:hover {
    background-color: rgba(0, 128, 0, 0.1);
    box-shadow: 0px 4px 10px rgba(0, 128, 0, 0.3);
}
</style>