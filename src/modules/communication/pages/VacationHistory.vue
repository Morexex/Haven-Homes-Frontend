<template>
    <HeaderTitle title="Vacation History" searchPlaceholder="Search Vacation" showSearch
        :buttons="[{ text: 'Apply Vacation', event: 'apply-vacation', color: 'green', icon: '' }]"
        @update:search="updateSearchQuery" @button-click="applyVacation" />

    <TableComponent title="Vacation History" :headers="headers" :items="vacations" :actions="actions"
        :loading="loading" />

    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" :title="confirmDialogTitle" :message="confirmDialogMessage"
        :confirmText="confirmDialogButtonText" cancelText="Cancel" @confirm="handleApproveStatus" />
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

interface Vacation {
    id: number;
    tenant_name: string;
    reason: string;
    room: number | null;
    status: string;
    formatted_application_date: string;
}

const router = useRouter();
const searchQuery = ref("");
const authStore = useAuthStore();
const dialog = ref(false);
const vacations = ref<Vacation[]>([]);
const toast = useToast();
const loading = ref(false);
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogMessage = ref("");
const confirmDialogButtonText = ref("");
const selectedVacation = ref<Vacation | null>(null);

// Open Add Tenant Modal
const applyVacation = () => {
    dialog.value = true;
};

const updateSearchQuery = (query: string) => {
    searchQuery.value = query;
};

// Show confirmation dialog before toggling activation
const confirmApproval = (vacation: Vacation) => {
    selectedVacation.value = vacation;
    confirmDialogMessage.value = `Are you sure you want to Approve this vacation?`;
    showConfirmDialog.value = true;
};

const handleApproveStatus = () => {
    
}

const headers = [
    { text: "ID", value: "id", sortable: false },
    { text: "Tenant", value: "tenant_name" },
    { text: "Room", value: "room" },
    { text: "Reason For Vaction", value: "reason" },
    { text: "Status", value: "status" },
    { text: "Application Date", value: "formatted_application_date"},
];

const fetchVacationHistory = async () => {
    loading.value = true;
    if (!authStore.propertyCode) {
        console.warn("Property-Code is missing");
        return;
    }
    try {
        const { data } = await apiClient.get("/vacations", {
            headers: { "Property-Code": authStore.propertyCode },
        });

        console.log("API Response:", data);
        vacations.value = Array.isArray(data.vacations) ? data.vacations : [];

    } catch (error) {
        toast.error("Failed to load vacation history.");
        console.error("Fetch error:", error);
    } finally {
        loading.value = false;
    }
};

const editVacation = (vacation: Vacation) => {
    selectedVacation.value = vacation;
    dialog.value = true;
};

// Navigate to ViewUserPage.vue with tenant details
const viewVacation = (vacation: Vacation) => {
    
};

const actions = [
    { name: "Edit", icon: "mdi-pencil", color: "orange", handler: editVacation },
    { name: "Approve", icon: "mdi-tick", color: "red", handler: confirmApproval },
    { name: "View", icon: "mdi-eye", color: "green", handler: viewVacation },
];

const refreshVacation = () => {
    fetchVacationHistory();
};

onMounted(fetchVacationHistory);
</script>
