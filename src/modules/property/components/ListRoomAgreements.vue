<template>
    <HeaderTitle title="Room Agreements" searchPlaceholder="Search Room Agreement" showSearch @update:search="updateSearchQuery" :buttons="[{ text: 'back', event: 'close', color: 'green', icon: 'mdi-close' }]" @button-click="goBack"
  />
  
    <TableComponent title="Room Agreements" :headers="headers" :items="filteredRoomAgreements" :actions="actions" :loading="loading" />
  
    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" title="Confirm Deletion"
      :message="`Are you sure you want to delete the room agreement belonging to ${selectedRoomAgreement?.tenant_name}?`" confirmText="Delete"
      cancelText="Cancel" @confirm="deleteRoomAgreement" />
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useToast } from "vue-toastification";
  import { useAuthStore } from "@/stores/authStore";
  import apiClient from "@/services/apiClient";
  import HeaderTitle from "@/components/HeaderTitle.vue";
  import TableComponent from "@/components/TableComponent.vue";
  import ConfirmDialog from "@/components/ConfirmationDialog.vue";
  
interface RoomAgreement {
  id: number;
  room_id: number;
  payment_date: string;
  tenancy_start_date: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  room_agreement: string;
  room_decline_reason: string | null;
  id_front: string | null;
  id_back: string | null;
  property_code: number;
  created_at: string;
  updated_at: string;
  room: {
    id: number;
    label: string;
    is_vacant: number;
    description: string | null;
    category_id: number;
    floor: string;
  };
}
  
  const searchQuery = ref("");
  const authStore = useAuthStore();
  const roomAgreements = ref<RoomAgreement[]>([]);
  const toast = useToast();
  const loading = ref(false);
  const router = useRouter();
  const selectedRoomAgreement = ref<RoomAgreement | null>(null);
  const showConfirmDialog = ref(false);
  
  const headers = [
    { text: "ID", value: "id", sortable: false },
    { text: "Tenant Name", value: "tenant_name" },
    { text: "Tenant Phone", value: "tenant_phone" },
    { text: "Room", value: "room_label" },
    { text: "Floor", value: "room_floor" },
    { text: "Vacancy Status", value: "room_is_vacant", slot: true },
    { text: "Tenancy Start Date", value: "formatted_tenancy_start_date" },
    { text: "Payment Date", value: "formatted_payment_date" },
  ];

  const goBack = () => {
      router.back();
    };
  
  const updateSearchQuery = (query: string) => (searchQuery.value = query);
  
  const fetchRoomsAgreements = async () => {
    loading.value = true;
    if (!authStore.propertyCode) return;
    try {
      const { data } = await apiClient.get(`/agreements`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      roomAgreements.value = data.map((agreement: RoomAgreement) => ({
        ...agreement,
        room_label: agreement.room.label,
        room_floor: agreement.room.floor,
        room_is_vacant: agreement.room.is_vacant,
      }));
    } catch (error) {
      toast.error(`Failed to load rooms. ${error}`);
    } finally {
      loading.value = false;
    }
  };
  
  // Show confirmation dialog before deleting
  const confirmDelete = (roomAgreement: RoomAgreement) => {
    selectedRoomAgreement.value = roomAgreement;
    showConfirmDialog.value = true;
  };
  
  // Only delete after confirmation
  const deleteRoomAgreement = async () => {
    if (!selectedRoomAgreement.value) return;
    try {
      await apiClient.delete(`/agreeements/${selectedRoomAgreement.value.id}`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Room Agreement deleted successfully!");
      fetchRoomsAgreements();
    } catch {
      toast.error("Failed to delete room agreement.");
    } finally {
      showConfirmDialog.value = false;
    }
  };
  
  const filteredRoomAgreements = computed(() =>
    roomAgreements.value.filter((roomAgreement) => roomAgreement.tenant_name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
  
  const viewRoomAgreement = (roomAgreement: RoomAgreement) => {
    router.push({ name: "AuditAgreement", params: { roomId: roomAgreement.room.id } });
};
  
  // Update delete action to call confirmDelete first
  const actions = [
    { name: "delete", icon: "mdi-delete", color: "red", handler: confirmDelete }, // Call confirmation first
    { name: "view", icon: "mdi-eye", color: "green", handler: viewRoomAgreement },
  ];
  
  onMounted(() => {
    fetchRoomsAgreements();
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
  