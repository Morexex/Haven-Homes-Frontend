<template>
    <HeaderTitle title="Room Charges" searchPlaceholder="Search Room Charge" showSearch @update:search="updateSearchQuery" :buttons="[{ text: 'back', event: 'close', color: 'green', icon: 'mdi-close' }]" @button-click="goBack"
  />
  
    <TableComponent title="Room Charges" :headers="headers" :items="filteredRoomCharges" :actions="actions" :loading="loading" />
  
    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" title="Confirm Deletion"
      :message="`Are you sure you want to delete the room charge ${selectedRoomCharge?.charge_type}?`" confirmText="Delete"
      cancelText="Cancel" @confirm="deleteRoomCharge" />

    <AddRoomChargesModal v-model="dialog" :charge="selectedRoomCharge" @charge-added="refreshCharges" @charge-updated="refreshCharges" />

    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon="mdi-plus" color="green" class="fab-button" />
      </template>
      <v-list>
        <v-list-item @click="handleButtonClick('add-charge')">
          <v-list-item-title>
            <v-icon color="orange" class="mr-2">mdi-cash</v-icon> Add Charge
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
  import AddRoomChargesModal from "./AddRoomChargesModal.vue";
  
interface RoomCharge {
  id: number;
  amount: number;
  charge_type: string;
  description: string;
  effective_date: string;
  created_at: string;
  room: Array<{
    id: number;
    label: string;
    description: string | null;
    created_at: string;
  }>
}
  
  const searchQuery = ref("");
  const authStore = useAuthStore();
  const roomCharges = ref<RoomCharge[]>([]);
  const toast = useToast();
  const loading = ref(false);
  const router = useRouter();
  const selectedRoomCharge = ref<RoomCharge | null>(null);
  const showConfirmDialog = ref(false);
  const dialog = ref(false);
  
  const headers = [
    { text: "ID", value: "id", sortable: false },
    { text: "Room", value: "room_name" },
    { text: "Charge Type", value: "charge_type" },
    { text: "Amount", value: "amount" },
    { text: "Description", value: "description" },
    { text: "Effective Date", value: "effective_date" },
    { text: "Created On", value: "formatted_created_at" },
  ];

  const goBack = () => {
      router.back();
    };
  
  const updateSearchQuery = (query: string) => (searchQuery.value = query);
  
  const fetchRoomsCharges = async () => {
    loading.value = true;
    if (!authStore.propertyCode) return;
    try {
      const { data } = await apiClient.get(`/charges`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      roomCharges.value = data.map((charge: RoomCharge) => ({
        ...charge,
        rooms: charge.room || [],
      }));
    } catch (error) {
      toast.error(`Failed to load charges. ${error}`);
    } finally {
      loading.value = false;
    }
  };
  
  // Show confirmation dialog before deleting
  const confirmDelete = (roomCharge: RoomCharge) => {
    selectedRoomCharge.value = roomCharge;
    showConfirmDialog.value = true;
  };

  const handleButtonClick = (event: string) => {
    if (event === "add-charge") dialog.value = true;
  };

  const refreshCharges = fetchRoomsCharges;

  
  // Only delete after confirmation
  const deleteRoomCharge = async () => {
    if (!selectedRoomCharge.value) return;
    try {
      await apiClient.delete(`/charges/${selectedRoomCharge.value.id}`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Charge deleted successfully!");
      fetchRoomsCharges();
    } catch {
      toast.error("Failed to delete charge.");
    } finally {
      showConfirmDialog.value = false;
    }
  };
  
  const filteredRoomCharges = computed(() =>
    roomCharges.value.filter((roomCharge) => roomCharge.charge_type.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
  

  const editRoomCharge = (roomCharge: RoomCharge) => {
    selectedRoomCharge.value = roomCharge; // Set the selected charge
    dialog.value = true; // Open the modal
  };
  
  // Update delete action to call confirmDelete first
  const actions = [
    { name: "Delete", icon: "mdi-delete", color: "red", handler: confirmDelete }, // Call confirmation first
    { name: "Edit", icon: "mdi-pencil", color: "orange", handler: editRoomCharge },
  ];
  
  onMounted(() => {
    fetchRoomsCharges();
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
  