<template>
    <HeaderTitle title="Room Amenities" searchPlaceholder="Search Room Amenity" showSearch @update:search="updateSearchQuery" :buttons="[{ text: 'back', event: 'close', color: 'green', icon: 'mdi-close' }]" @button-click="goBack"
  />
  
    <TableComponent title="Room Amenities" :headers="headers" :items="filteredRoomAmenities" :actions="actions" :loading="loading" />
  
    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" title="Confirm Deletion"
      :message="`Are you sure you want to delete the room amenity ${selectedRoomAmenity?.label}? Remember, deleting this amenity will result in the deleting of the images under it!!`" confirmText="Delete"
      cancelText="Cancel" @confirm="deleteRoomAmenity" />

    <AddAmenityModal v-model="amenityDialog" :amenity="selectedRoomAmenity" @amenity-added="refreshAmenities" @amenity-updated="refreshAmenities" />

    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon="mdi-plus" color="green" class="fab-button" />
      </template>
      <v-list>
        <v-list-item @click="handleButtonClick('add-amenity')">
          <v-list-item-title>
            <v-icon color="orange" class="mr-2">mdi-shower</v-icon> Add Amenity
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useToast } from "vue-toastification";
  import { useAuthStore } from "@/stores/authStore";
  import apiClient from "@/services/apiClient";
  import HeaderTitle from "./HeaderTitle.vue";
  import TableComponent from "./TableComponent.vue";
  import ConfirmDialog from "./ConfirmationDialog.vue";
  import AddAmenityModal from "./AddAmenityModal.vue";
  
interface RoomAmenity {
  id: number;
  label: string;
  description: string;
  size:string;
  color:string;
  condition:string;
  created_at: string;
  updated_at: string;
  category: Array<{
    id: number;
    label: string;
    description: string | null;
    created_at: string;
  }>
}
  
  const searchQuery = ref("");
  const authStore = useAuthStore();
  const roomAmenities = ref<RoomAmenity[]>([]);
  const toast = useToast();
  const loading = ref(false);
  const router = useRouter();
  const selectedRoomAmenity = ref<RoomAmenity | null>(null);
  const showConfirmDialog = ref(false);
  const amenityDialog = ref(false);
  
  const headers = [
    { text: "ID", value: "id", sortable: false },
    { text: "Label", value: "label" },
    { text: "Description", value: "description" },
    { text: "Size", value: "size" },
    { text: "Category", value: "category_name" },
    { text: "Color", value: "color" },
    { text: "Condition", value: "condition" },
    { text: "Created On", value: "formatted_created_at" },
  ];

  const goBack = () => {
      router.back();
    };
  
  const updateSearchQuery = (query: string) => (searchQuery.value = query);
  
  const fetchRoomsAmenity = async () => {
    loading.value = true;
    if (!authStore.propertyCode) return;
    try {
      const { data } = await apiClient.get(`/amenities`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      roomAmenities.value = data.map((amenity: RoomAmenity) => ({
        ...amenity,
        categories: amenity.category || [],
      }));
    } catch (error) {
      toast.error(`Failed to load rooms. ${error}`);
    } finally {
      loading.value = false;
    }
  };
  
  // Show confirmation dialog before deleting
  const confirmDelete = (roomAmenity: RoomAmenity) => {
    selectedRoomAmenity.value = roomAmenity;
    showConfirmDialog.value = true;
  };

  const handleButtonClick = (event: string) => {
    if (event === "add-amenity") amenityDialog.value = true;
  };

  const refreshAmenities = fetchRoomsAmenity;

  
  // Only delete after confirmation
  const deleteRoomAmenity = async () => {
    if (!selectedRoomAmenity.value) return;
    try {
      await apiClient.delete(`/amenities/${selectedRoomAmenity.value.id}`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Amenity deleted successfully!");
      fetchRoomsAmenity();
    } catch {
      toast.error("Failed to delete amenity.");
    } finally {
      showConfirmDialog.value = false;
    }
  };
  
  const filteredRoomAmenities = computed(() =>
    roomAmenities.value.filter((roomAmenity) => roomAmenity.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
  

  const editRoomAmenity = (roomAmenity: RoomAmenity) => {
    selectedRoomAmenity.value = roomAmenity; // Set the selected amenity
    amenityDialog.value = true; // Open the modal
  };
  
  // Update delete action to call confirmDelete first
  const actions = [
    { name: "delete", icon: "mdi-delete", color: "red", handler: confirmDelete }, // Call confirmation first
    { name: "edit", icon: "mdi-pencil", color: "orange", handler: editRoomAmenity },
  ];
  
  onMounted(() => {
    fetchRoomsAmenity();
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
  