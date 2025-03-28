<template>
    <HeaderTitle title="Complaints" searchPlaceholder="Search Complaints" showSearch @update:search="updateSearchQuery" :buttons="[{ text: 'File Complaint', event: 'complaint-thread', color: 'green', icon: 'plus' }]"
  @button-click="fileComplaint"/>
  
    <TableComponent title="Complaints" :headers="headers" :items="filteredComplaints" :actions="actions" :loading="loading" />
  
    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" title="Confirm Deletion"
      :message="`Are you sure you want to delete the complaint ${selectedComplaint?.title}?`" confirmText="Delete"
      cancelText="Cancel" @confirm="deleteComplaint" />
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
  
  interface Complaint {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    complainant: string;
    incident_date: string;
    assigned_to: string;
  }
  
  const searchQuery = ref("");
  const authStore = useAuthStore();
  const dialog = ref(false);
  const complaints = ref<Complaint[]>([]);
  const toast = useToast();
  const loading = ref(false);
  const router = useRouter();
  const selectedComplaint = ref<Complaint | null>(null);
  const showConfirmDialog = ref(false);
  
  const headers = [
    { text: "ID", value: "id", sortable: false },
    { text: "Title", value: "title" },
    { text: "Description", value: "description" },
    { text: "Category", value: "category" },
    { text: "Priority", value: "priority" },
    { text: "Status", value: "status" },
    { text: "Complainant", value: "complainant" },
    { text: "Incident Date", value: "incident_date" },
    { text: "Assigned To", value: "assigned_to" },
  ];
  
  const updateSearchQuery = (query: string) => (searchQuery.value = query);
  
  const fileComplaint = (complaint: Complaint) => {
    router.push({ name: "ComplaintThread", params: { complaintId: 'new'} });
  };
  
  const fetchComplaints = async () => {
    loading.value = true;
    if (!authStore.propertyCode) return;
    try {
      const { data } = await apiClient.get("/complaints", {
        headers: { "Property-Code": authStore.propertyCode },
      });
      complaints.value = data;
    } catch {
      toast.error("Failed to load complaints.");
    } finally {
      loading.value = false;
    }
  };
  
  // Show confirmation dialog before deleting
  const confirmDelete = (complaint: Complaint) => {
    selectedComplaint.value = complaint;
    showConfirmDialog.value = true;
  };
  
  // Only delete after confirmation
  const deleteComplaint = async () => {
    if (!selectedComplaint.value) return;
    try {
      await apiClient.delete(`/complaints/${selectedComplaint.value.id}`, {
        headers: { "Property-Code": authStore.propertyCode },
      });
      toast.success("Complain Thread deleted successfully!");
      fetchComplaints();
    } catch {
      toast.error("Failed to delete complaint.");
    } finally {
      showConfirmDialog.value = false;
    }
  };
  
  const refreshComplaints = fetchComplaints
  
  const filteredComplaints = computed(() =>
    complaints.value.filter((complaint) => complaint.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
  
  const viewComplaint = (complaint: Complaint) => {
    router.push({ name: "ComplaintThread", params: { id: complaint.id } });
  };
  
  // Update delete action to call confirmDelete first
  const actions = [
    { name: "Delete", icon: "mdi-delete", color: "red", handler: confirmDelete },
    { name: "View", icon: "mdi-eye", color: "green", handler: viewComplaint },
  ];
  
  onMounted(() => {
    fetchComplaints();
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
  