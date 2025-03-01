<template>
  <HeaderTitle title="Rooms" searchPlaceholder="Search Rooms" showSearch @update:search="updateSearchQuery" />

  <!-- Room Table Component -->
  <TableComponent title="Rooms" :headers="headers" :items="filteredRooms" :actions="actions" :loading="loading" />

  <!-- Floating Plus Button with Menu -->
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

  <!-- Register Dialogs Component -->
  <AddCategoryModal v-model="categoryDialog" @category-added="refreshCategories" />
  <AddRoomModal v-model="dialog" @room-added="refreshRooms" />
</template>

<script lang="ts">
import { ref, computed, onMounted } from "vue";
import HeaderTitle from "./HeaderTitle.vue";
import AddCategoryModal from "./AddCategoryModal.vue";
import AddRoomModal from "./AddRoomModal.vue";
import TableComponent from "./TableComponent.vue";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import { useToast } from "vue-toastification";

// Define the Room interface
interface Room {
  id: number;
  label: string;
  floor: string;
  quantity: number;
  description: string;
  is_vacant: boolean;
}

export default {
  components: { HeaderTitle, AddCategoryModal, AddRoomModal, TableComponent },
  setup() {
    const searchQuery = ref("");
    const authStore = useAuthStore();
    const dialog = ref(false);
    const categoryDialog = ref(false);
    const rooms = ref<Room[]>([]);  // Explicitly type rooms as an array of Room objects
    const toast = useToast();
    const loading = ref(false);

    // Define table headers
    const headers = ref([
      { text: "ID", value: "id", sortable: false },
      { text: "Label", value: "label" },
      { text: "Floor", value: "floor" },
      { text: "Quantity", value: "quantity" },
      { text: "Description", value: "description" },
      { text: "Vacant", value: "is_vacant" },
    ]);

    // Define table actions
    const actions = ref([
      {
        name: "edit",
        icon: "mdi-pencil",
        color: "orange",
        handler: (room: Room) => editRoom(room),
      },
      {
        name: "delete",
        icon: "mdi-delete",
        color: "red",
        handler: (room: Room) => deleteRoom(room),
      },
      {
        name: "view",
        icon: "mdi-eye",
        color: "green",
        handler: (room: Room) => viewRoom(room),
      },
    ]);

    // Update search query
    const updateSearchQuery = (query: string) => {
      searchQuery.value = query;
    };

    // Handle button click to open modals
    const handleButtonClick = (event: string) => {
      if (event === "add-room") {
        dialog.value = true;
      } else if (event === "add-category") {
        categoryDialog.value = true;
      }
    };

    // Fetch rooms from the API
    const fetchRooms = async () => {
      loading.value = true;
      if (!authStore.propertyCode) {
        console.error("Property Code is missing!");
        loading.value = false;
        return;
      }

      try {
        const response = await apiClient.get("/rooms", {
          headers: { "Property-Code": authStore.propertyCode },
        });
        rooms.value = response.data;
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to load rooms.");
      } finally {
        loading.value = false;
      }
    };

    // Fetch categories from the API
    const fetchCategories = async () => {
      if (!authStore.propertyCode) {
        console.error("Property Code is missing!");
        return;
      }

      try {
        const response = await apiClient.get("/room-categories", {
          headers: { "Property-Code": authStore.propertyCode },
        });
        console.log("Categories:", response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load room categories.");
      }
    };

    // Handle edit room
    const editRoom = (room: Room) => {
      console.log("Edit room:", room);
    };

    // Handle delete room
    const deleteRoom = async (room: Room) => {
      if (!confirm(`Are you sure you want to delete ${room.label}?`)) return;

      try {
        await apiClient.delete(`/rooms/${room.id}`);
        toast.success("Room deleted successfully!");
        fetchRooms(); // Refresh room list
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete room.");
      }
    };

    // Refresh categories after a category is added
    const refreshCategories = () => {
      console.log("Category added! Refreshing categories...");
      fetchCategories();
    };

    // Refresh rooms after a room is added
    const refreshRooms = () => {
      console.log("Room added successfully, refreshing rooms list...");
      fetchRooms();
    };

    // Filter rooms based on the search query
    const filteredRooms = computed(() => {
      return rooms.value.filter(room =>
        room.label.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // View room details
    const viewRoom = (room: Room) => {
      console.log("View room details:", room);
      // Implement view room details logic here
    };

    // Fetch rooms and categories on mounted
    onMounted(() => {
      fetchRooms();
      fetchCategories();
    });

    return {
      updateSearchQuery,
      handleButtonClick,
      refreshCategories,
      refreshRooms,
      fetchRooms,
      fetchCategories,
      rooms,
      headers,
      actions,
      loading,
      editRoom,
      dialog,
      categoryDialog,
      filteredRooms,
    };
  },
};
</script>

<style scoped>
.fab-button {
  position: fixed;
  bottom: 44px;
  right: 20px;
  z-index: 1000;
}
</style>
