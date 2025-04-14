<template>
  <!-- Close icon -->
  <v-row class="mb-4">
    <v-col cols="12" class="d-flex justify-end">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-col>
  </v-row>
  <HeaderTitle title="Complaints" searchPlaceholder="Search Complaints" showSearch @update:search="updateSearchQuery"
    :buttons="[{ text: 'File Complaint', event: 'complaint-thread', color: 'green', icon: 'plus' }]"
    @button-click="fileComplaint" />

  <TableComponent title="Complaints" :headers="headers" :items="filteredComplaints" :actions="actions"
    :loading="loading" />

  <!-- Confirmation Dialog -->
  <ConfirmDialog v-model="showConfirmDialog" title="Confirm Deletion"
    :message="`Are you sure you want to delete the complaint ${selectedComplaint?.title}?`" confirmText="Delete"
    cancelText="Cancel" @confirm="deleteComplaint" />

  <!-- Assign Complaint modal -->
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5 font-weight-bold">Assign Complaint</v-card-title>
      <v-card-text>
        <p>Assign complaint to:</p>
        <br>
        <v-select v-model="assigneeName" label="Select Staff" :items="staffs" item-title="name" item-value="id" required
          variant="outlined"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn color="red" @click="dialog = false">Cancel</v-btn>
        <v-btn color="green" @click="handleAssignComplaint">Assign</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
  complainant_name: string;
  incident_date: string;
  assignee_name: string;
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
const staffs = ref<Array<{ id: number; name: string }>>([]);
const assigneeName = computed({
  get: () => selectedComplaint.value?.assignee_name || "",
  set: (newValue) => {
    if (selectedComplaint.value) {
      selectedComplaint.value.assignee_name = newValue;
    }
  }
});

const headers = [
  { text: "ID", value: "id", sortable: false },
  { text: "Title", value: "title" },
  { text: "Description", value: "description" },
  { text: "Category", value: "category" },
  { text: "Priority", value: "priority" },
  { text: "Status", value: "status" },
  { text: "Complainant", value: "complainant_name" },
  { text: "Incident Date", value: "incident_date" },
  { text: "Assigned To", value: "assignee_name" },
];


const updateSearchQuery = (query: string) => (searchQuery.value = query);

const fileComplaint = (complaint: Complaint) => {
  router.push({ name: "ComplaintThread", params: { complaintId: 'new' } });
};

const handleAssignComplaint = async () => {
  if (!selectedComplaint.value) return;
  try {
    loading.value = true;
    const complaintId = selectedComplaint.value.id;
    const assigneeId = assigneeName.value;
    await apiClient.put(`/complaints/${complaintId}`, { assigned_to: assigneeId }, {
      headers: { "Property-Code": authStore.propertyCode },
    });
    toast.success("Complaint assigned successfully!");
  } catch (error) {
    toast.error("Failed to assign complaint.");
  } finally {
    dialog.value = false;
    loading.value = false;
  }
};

const fetchComplaints = async () => {
  loading.value = true;
  if (!authStore.propertyCode) return;
  try {
    const { data } = await apiClient.get("/complaints", {
      headers: { "Property-Code": authStore.propertyCode },
    });
    complaints.value = data.data;
  } catch {
    toast.error("Failed to load complaints.");
  } finally {
    loading.value = false;
  }
};

const fetchStaffs = async () => {
  loading.value = true;
  if (!authStore.propertyCode) return;
  try {
    const { data } = await apiClient.get("/staffs", {
      headers: { "Property-Code": authStore.propertyCode },
    });
    staffs.value = data.staffs;
    console.log(staffs.value);
  } catch {
    toast.error("Failed to load staffs.");
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
  router.push({ name: "ComplaintThread", params: { complaintId: complaint.id } });
};

const ResolveComplaint = async (complaint: Complaint) => {
  //update the pending status to resolved
  loading.value = true;
  const complaintId = complaint.id;
  //pass complaint status as resolved to be saved in the database
  complaint.status = "Resolved";
  if (!authStore.propertyCode) return;
  try {
    await apiClient.put(`/complaints/${complaintId}`, complaint, {
      headers: { "Property-Code": authStore.propertyCode },
    });
    toast.success("Complaint marked as resolved!");
  } catch {
    toast.error("Mark as resolved failed.");
  } finally {
    loading.value = false;
  }
};

const PromptAssignModal = (complaint: Complaint) => {
  selectedComplaint.value = complaint;
  dialog.value = true;
  fetchStaffs();
};

const ReviewService = (complaint: Complaint) => {
  router.push({ name: "ReviewService", params: { complaintId: complaint.id } });
};

// Update delete action to call confirmDelete first
const actions = [
  { name: "Delete", icon: "mdi-delete", color: "red", handler: confirmDelete },
  { name: "View", icon: "mdi-eye", color: "green", handler: viewComplaint },
  { name: "Mark As Resolved", icon: "mdi-check", color: "blue", handler: ResolveComplaint },
  { name: "Review Service", icon: "mdi-star", color: "yellow", handler: ReviewService },
  { name: "Assign Complaint", icon: "mdi-account-check", color: "purple", handler: PromptAssignModal },
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