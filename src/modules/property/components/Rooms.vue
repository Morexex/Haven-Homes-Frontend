<template>
  <HeaderTitle title="Rooms" searchPlaceholder="Search Rooms" showSearch @update:search="updateSearchQuery" :buttons="[{ text: 'More Details', event: 'more-details', color: 'green', icon: 'plus' }]"
@button-click="moreAboutRoom"/>

  <TableComponent title="Rooms" :headers="headers" :items="filteredRooms" :actions="actions" :loading="loading" />

  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-plus" color="green" class="fab-button" />
    </template>
    <v-list>
      <v-list-item @click="handleButtonClick('add-room')">
        <v-list-item-title>
          <v-icon color="green" class="mr-2">mdi-door</v-icon> Add Room
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="handleButtonClick('add-category')">
        <v-list-item-title>
          <v-icon color="orange" class="mr-2">mdi-shape</v-icon> Add Category
        </v-list-item-title>
      </v-list-item>
      <!-- add amenity button -->
      <v-list-item @click="handleButtonClick('add-amenity')">
        <v-list-item-title>
          <v-icon color="blue" class="mr-2">mdi-shower</v-icon> Add Amenity
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="handleButtonClick('add-room-charge')">
        <v-list-item-title>
          <v-icon color="purple" class="mr-2">mdi-cash</v-icon> Add Room Charge
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <AddCategoryModal v-model="categoryDialog" @category-added="refreshCategories" />
  <AddRoomModal v-model="dialog" :room="selectedRoom" @room-added="refreshRooms" @room-updated="refreshRooms" />
  <AddAmenityModal v-model="amenityDialog" @amenity-added="refreshAmenities" />
  <AddRoomChargesModal v-model="chargesDialog" @charges-added="refreshCharges" />

  <!-- Confirmation Dialog -->
  <ConfirmDialog v-model="showConfirmDialog" title="Confirm Deletion"
    :message="`Are you sure you want to delete the room ${selectedRoom?.label}?`" confirmText="Delete"
    cancelText="Cancel" @confirm="deleteRoom" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import HeaderTitle from "@/components/HeaderTitle.vue";
import AddCategoryModal from "./AddCategoryModal.vue";
import AddRoomModal from "./AddRoomModal.vue";
import TableComponent from "@/components/TableComponent.vue";
import ConfirmDialog from "@/components/ConfirmationDialog.vue";
import AddAmenityModal from "./AddAmenityModal.vue";
import AddRoomChargesModal from "./AddRoomChargesModal.vue";

interface Room {
  id: number;
  label: string;
  floor: string;
  quantity: number;
  description: string;
  is_vacant: boolean;
}

const searchQuery = ref("");
const authStore = useAuthStore();
const dialog = ref(false);
const categoryDialog = ref(false);
const amenityDialog = ref(false);
const chargesDialog = ref(false);
const rooms = ref<Room[]>([]);
const toast = useToast();
const loading = ref(false);
const router = useRouter();
const selectedRoom = ref<Room | null>(null);
const showConfirmDialog = ref(false);

const headers = [
  { text: "ID", value: "id", sortable: false },
  { text: "Name", value: "label" },
  { text: "Category", value: "category_name" },
  { text: "Floor", value: "floor" },
  { text: "Quantity", value: "quantity" },
  { text: "Description", value: "description" },
  { text: "Vacancy Status", value: "is_vacant", slot: true },
  { text: "Created On", value: "formatted_created_at" },
];

const updateSearchQuery = (query: string) => (searchQuery.value = query);

const handleButtonClick = (event: string) => {
  if (event === "add-room") dialog.value = true;
  else if (event === "add-category") categoryDialog.value = true;
  else if (event === "add-amenity") amenityDialog.value = true;
  else if (event === "add-room-charge") chargesDialog.value = true;
};

const moreAboutRoom = (event: string) => {
  if (event === "more-details") router.push({ name: "MoreDetails" });
};

const fetchRooms = async () => {
  loading.value = true;
  if (!authStore.propertyCode) return;
  try {
    const { data } = await apiClient.get("/rooms", {
      headers: { "Property-Code": authStore.propertyCode },
    });
    rooms.value = data;
  } catch {
    toast.error("Failed to load rooms.");
  } finally {
    loading.value = false;
  }
};

const fetchAmenities = async () => {
  if (!authStore.propertyCode) return;
  try {
    await apiClient.get("/amenities", {
      headers: { "Property-Code": authStore.propertyCode },
    });
  } catch {
    toast.error("Failed to load amenities.");
  }
};

const fetchCharges = async () => {
  if (!authStore.propertyCode) return;
  try {
    await apiClient.get("/charges", {
      headers: { "Property-Code": authStore.propertyCode },
    });
  } catch {
    toast.error("Failed to load amenities.");
  }
};

// Show confirmation dialog before deleting
const confirmDelete = (room: Room) => {
  selectedRoom.value = room;
  showConfirmDialog.value = true;
};

const fetchCategories = async () => {
  if (!authStore.propertyCode) return;
  try {
    await apiClient.get("/room-categories", {
      headers: { "Property-Code": authStore.propertyCode },
    });
  } catch {
    toast.error("Failed to load room categories.");
  }
};

const editRoom = (room: Room) => {
  selectedRoom.value = room;
  dialog.value = true;
};

// Only delete after confirmation
const deleteRoom = async () => {
  if (!selectedRoom.value) return;
  try {
    await apiClient.delete(`/rooms/${selectedRoom.value.id}`, {
      headers: { "Property-Code": authStore.propertyCode },
    });
    toast.success("Room deleted successfully!");
    fetchRooms();
  } catch {
    toast.error("Failed to delete room.");
  } finally {
    showConfirmDialog.value = false;
  }
};

const addRoomImages = (room: Room) => {
  router.push({ name: "ManageRoomImages", params: { id: room.id } });
};

const auditAgreement = (room: Room) => {
  if (!room.id) {
    console.error("Error: Room ID is missing!");
    return;
  }
  router.push({ name: "AuditAgreement", params: { roomId: room.id } });
};

const refreshCategories = fetchCategories;
const refreshRooms = fetchRooms;
const refreshAmenities = fetchAmenities;
const refreshCharges = fetchCharges;

const filteredRooms = computed(() =>
  rooms.value.filter((room) => room.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
);

const viewRoom = (room: Room) => {
  router.push({ name: "RoomDetails", params: { id: room.id } });
};

// Update delete action to call confirmDelete first
const actions = [
  { name: "Edit", icon: "mdi-pencil", color: "orange", handler: editRoom },
  { name: "Delete", icon: "mdi-delete", color: "red", handler: confirmDelete }, // Call confirmation first
  { name: "View", icon: "mdi-eye", color: "green", handler: viewRoom },
  { name: "Add Images", icon: "mdi-camera", color: "teal", handler: addRoomImages },
  { name: "Audit Agreement", icon: "mdi-file-document", color: "blue", handler: auditAgreement }
];

onMounted(() => {
  fetchRooms();
  fetchCategories();
  fetchAmenities();
  fetchCharges();
});
</script>

<style scoped>
.fab-button {
  position: fixed;
  bottom: 44px;
  right: 20px;
  z-index: 1000;
}
</style>
