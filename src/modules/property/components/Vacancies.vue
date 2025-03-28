<template>
  <div>
    <HeaderTitle title="Vacancies" searchPlaceholder="Search Vacancies" showSearch @update:search="updateSearchQuery" :buttons="[{ text: 'back', event: 'close', color: 'green', icon: 'mdi-close' }]" @button-click="goBack"/>
    
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="green" size="50"></v-progress-circular>
    </div>
    
    <v-row v-else-if="filteredVacancies.length === 0">
      <v-col cols="12">
        <v-card class="empty-card mx-auto" max-width="344">
          <v-card-title>No Rooms for this property</v-card-title>
        </v-card>
      </v-col>
    </v-row>
    
    
    <v-row v-else>
      <v-col v-for="room in filteredVacancies" :key="room.id" cols="12" md="4">
        <v-card class="property-card mx-auto" max-width="344" hover @click="viewRoom(room)">
          <v-card-item>
            <v-card-title>{{ room.label }}</v-card-title>
            <v-card-subtitle>{{ room.floor }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-row align="center">
              <v-col cols="5">
                <v-img v-if="roomImages[room.id]?.[0]" :src="roomImages[room.id][0]" height="100" cover class="rounded-lg"></v-img>
                <v-icon v-else color="green" size="100">mdi-door</v-icon>
              </v-col>
              <v-col cols="7">
                <div>No Of Rooms: {{ room.quantity }}</div>
                <v-chip :color="room.is_vacant ? 'green' : 'orange'" label>
                  {{ room.is_vacant ? 'Vacant' : 'Occupied' }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import apiClient from "@/services/apiClient";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const props = defineProps(["categoryId"]);

const rooms = ref<Room[]>([]);
const searchQuery = ref("");
const loading = ref(false);
const roomImages = ref<Record<number, string[]>>({});
const toast = useToast();
const authStore = useAuthStore();
const router = useRouter();


interface Room {
  id: number;
  label: string;
  floor: string;
  quantity: number;
  is_vacant: boolean;
}

const fetchRooms = async () => {
  loading.value = true;
  if (!authStore.propertyCode) return;
  try {
    const endpoint = props.categoryId ? `/rooms/${props.categoryId}/categories` : "/rooms";
    const { data } = await apiClient.get(endpoint, {
      headers: { "Property-Code": authStore.propertyCode },
    });
    rooms.value = data;
    await Promise.all(rooms.value.map((room) => fetchRoomImages(room.id)));
  } catch (error) {
    toast.error(`Failed to load rooms: ${error}`);
  } finally {
    loading.value = false;
  }
};

const fetchRoomImages = async (roomId: number) => {
  try {
    const response = await apiClient.get(`/rooms/${roomId}/images`, {
      headers: { "Property-Code": authStore.propertyCode },
    });
    if (Array.isArray(response.data.images) && response.data.images.length > 0) {
      roomImages.value[roomId] = response.data.images.map((image: { image_url: string }) => image.image_url);
    }
  } catch (error) {
    console.error("Failed to fetch images:", error);
    toast.error("Failed to load room images.");
  }
};

const goBack = () => {
  router.back();
};

const filteredVacancies = computed(() =>
  rooms.value.filter((room) => room.label?.toLowerCase().includes(searchQuery.value.toLowerCase()))
);

const viewRoom = (room: Room) => {
  router.push({ name: "RoomDetails", params: { id: room.id } });
};

const updateSearchQuery = (query: string) => {
  searchQuery.value = query;
};

onMounted(fetchRooms);
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
.empty-card {
  border: 2px dashed green;
  text-align: center;
}
</style>