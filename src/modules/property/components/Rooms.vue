<template>
  <HeaderTitle title="Rooms" searchPlaceholder="Search Rooms" showSearch @update:search="updateSearchQuery" />

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
    </v-list>
  </v-menu>

  <AddCategoryModal v-model="categoryDialog" @category-added="refreshCategories" />
  <AddRoomModal v-model="dialog" :room="selectedRoom" @room-added="refreshRooms" @room-updated="refreshRooms" />

  <!-- Confirmation Dialog -->
  <ConfirmDialog
    v-model="showConfirmDialog"
    title="Confirm Deletion"
    :message="`Are you sure you want to delete the room ${selectedRoom?.label}?`"
    confirmText="Delete"
    cancelText="Cancel"
    @confirm="deleteRoom"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import HeaderTitle from "./HeaderTitle.vue";
import AddCategoryModal from "./AddCategoryModal.vue";
import AddRoomModal from "./AddRoomModal.vue";
import TableComponent from "./TableComponent.vue";
import ConfirmDialog from "./ConfirmationDialog.vue";

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
const rooms = ref<Room[]>([]);
const toast = useToast();
const loading = ref(false);
const router = useRouter();
const selectedRoom = ref<Room | null>(null);
const showConfirmDialog = ref(false);

const headers = [
  { text: "ID", value: "id", sortable: false },
  { text: "Label", value: "label" },
  { text: "Floor", value: "floor" },
  { text: "Quantity", value: "quantity" },
  { text: "Description", value: "description" },
  { text: "Vacant", value: "is_vacant" },
];

const updateSearchQuery = (query: string) => (searchQuery.value = query);

const handleButtonClick = (event: string) => {
  if (event === "add-room") dialog.value = true;
  else if (event === "add-category") categoryDialog.value = true;
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

const refreshCategories = fetchCategories;
const refreshRooms = fetchRooms;

const filteredRooms = computed(() =>
  rooms.value.filter((room) => room.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
);

const viewRoom = (room: Room) => console.log("View room details:", room);

// Update delete action to call confirmDelete first
const actions = [
  { name: "edit", icon: "mdi-pencil", color: "orange", handler: editRoom },
  { name: "delete", icon: "mdi-delete", color: "red", handler: confirmDelete }, // Call confirmation first
  { name: "view", icon: "mdi-eye", color: "green", handler: viewRoom },
  { name: "Add Images", icon: "mdi-camera", color: "teal", handler: addRoomImages },
];

onMounted(() => {
  fetchRooms();
  fetchCategories();
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
