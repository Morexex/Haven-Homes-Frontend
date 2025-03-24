<template>
    <HeaderTitle title="Room Categories" searchPlaceholder="Search Room Category" showSearch @update:search="updateSearchQuery" :buttons="[{ text: 'back', event: 'close', color: 'green', icon: 'mdi-close' }]" @button-click="goBack"
  />
  
    <TableComponent title="Room Categories" :headers="headers" :items="filteredRoomCategories" :actions="actions" :loading="loading" />
  
    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" title="Confirm Deletion"
      :message="`Are you sure you want to delete the room category ${selectedRoomCategory?.label}?`" confirmText="Delete"
      cancelText="Cancel" @confirm="deleteRoomCategory" />
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
  
interface RoomCategory {
  id: number;
  label: string;
  description: string;
  created_at: string;
  updated_at: string;
  rooms: Array<{
    id: number;
    label: string;
    is_vacant: number;
    description: string | null;
    category_id: number;
    floor: string;
    quantity: number;
    created_at: string;
  }>
}
  
  const searchQuery = ref("");
  const authStore = useAuthStore();
  const roomCategories = ref<RoomCategory[]>([]);
  const toast = useToast();
  const loading = ref(false);
  const router = useRouter();
  const selectedRoomCategory = ref<RoomCategory | null>(null);
  const showConfirmDialog = ref(false);
  
  const headers = [
    { text: "ID", value: "id", sortable: false },
    { text: "Label", value: "label" },
    { text: "Description", value: "description" },
    { text: "Total Rooms", value: "rooms_count" },
    { text: "Created At", value: "formatted_created_at" },
  ];

  const goBack = () => {
      router.back();
    };
  
  const updateSearchQuery = (query: string) => (searchQuery.value = query);
  
  const fetchRoomsCategory = async () => {
    loading.value = true;
    if (!authStore.propertyCode) return;
    try {
      const { data } = await apiClient.get(`/room-categories`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      roomCategories.value = data.map((category: RoomCategory) => ({
        ...category,
        rooms: category.rooms || [],
      }));
    } catch (error) {
      toast.error(`Failed to load rooms. ${error}`);
    } finally {
      loading.value = false;
    }
  };
  
  // Show confirmation dialog before deleting
  const confirmDelete = (roomCategory: RoomCategory) => {
    selectedRoomCategory.value = roomCategory;
    showConfirmDialog.value = true;
  };
  
  // Only delete after confirmation
  const deleteRoomCategory = async () => {
    if (!selectedRoomCategory.value) return;
    try {
      await apiClient.delete(`/room-categories/${selectedRoomCategory.value.id}`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Category deleted successfully!");
      fetchRoomsCategory();
    } catch {
      toast.error("Failed to delete category.");
    } finally {
      showConfirmDialog.value = false;
    }
  };
  
  const filteredRoomCategories = computed(() =>
    roomCategories.value.filter((roomCategory) => roomCategory.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
  
  const viewRoomCategory = (roomCategory: RoomCategory) => {
    router.push({ name: "Vacancies", params: { categoryId: roomCategory.id } });
  };
  
  // Update delete action to call confirmDelete first
  const actions = [
    { name: "delete", icon: "mdi-delete", color: "red", handler: confirmDelete }, // Call confirmation first
    { name: "view", icon: "mdi-eye", color: "green", handler: viewRoomCategory },
  ];
  
  onMounted(() => {
    fetchRoomsCategory();
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
  