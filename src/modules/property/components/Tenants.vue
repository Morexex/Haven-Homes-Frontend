<template>
    <HeaderTitle title="Tenants" searchPlaceholder="Search Tenants" showSearch
        :buttons="[{ text: 'Add Tenant', event: 'add-tenant', color: 'green', icon: 'plus' }]"
        @update:search="updateSearchQuery" @button-click="addTenant" />
    <TableComponent title="Tenants" :headers="headers" :items="formattedTenants" :actions="actions"
        :loading="loading" />
    
    <!-- Register Property Dialog -->
    <AddTenantsModal v-model="dialog" :tenant="selectedTenant" @tenant-added="refreshTenants"
        @tenant-updated="refreshTenants" />

    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" :title="confirmDialogTitle"
        :message="confirmDialogMessage" :confirmText="confirmDialogButtonText"
        cancelText="Cancel" @confirm="toggleTenantStatus" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import HeaderTitle from "./HeaderTitle.vue";
import AddTenantsModal from "./AddTenantsModal.vue";
import TableComponent from "./TableComponent.vue";
import ConfirmDialog from "./ConfirmationDialog.vue";

interface Tenant {
    id: number;
    name: string;
    email: string;
    phone: string;
    room_id: number | null;
    status: string;
    role: string;
}

const searchQuery = ref("");
const authStore = useAuthStore();
const dialog = ref(false);
const tenants = ref<Tenant[]>([]);
const toast = useToast();
const loading = ref(false);
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogMessage = ref("");
const confirmDialogButtonText = ref("");

const selectedTenant = ref<Tenant | null>(null);

// Open Add Tenant Modal
const addTenant = () => {
    dialog.value = true;
};

const updateSearchQuery = (query: string) => {
    searchQuery.value = query;
};

// Show confirmation dialog before toggling activation
const confirmDeactivation = (tenant: Tenant) => {
    selectedTenant.value = tenant;
    if (tenant.status === "inactive") {
        confirmDialogTitle.value = "Confirm Activation";
        confirmDialogMessage.value = `Are you sure you want to activate this tenant ${tenant.name}?`;
        confirmDialogButtonText.value = "Activate";
    } else {
        confirmDialogTitle.value = "Confirm Deactivation";
        confirmDialogMessage.value = `Are you sure you want to deactivate this tenant ${tenant.name}?`;
        confirmDialogButtonText.value = "Deactivate";
    }
    showConfirmDialog.value = true;
};

const headers = [
    { text: "ID", value: "id", sortable: false },
    { text: "Name", value: "name" },
    { text: "Phone Number", value: "phone" },
    { text: "Role", value: "role" },
    { text: "Room", value: "room_id" },
    { text: "Status", value: "status" },
];

const fetchTenants = async () => {
    loading.value = true;
    if (!authStore.propertyCode) {
        console.warn("Property-Code is missing");
        return;
    }
    try {
        const { data } = await apiClient.get("/tenants", {
            headers: { "Property-Code": authStore.propertyCode },
        });

        console.log("API Response:", data); // Debugging
        tenants.value = Array.isArray(data.tenants) ? data.tenants : []; // ✅ Extract array correctly

    } catch (error) {
        toast.error("Failed to load tenants.");
        console.error("Fetch error:", error);
    } finally {
        loading.value = false;
    }
};


const editTenant = (tenant: Tenant) => {
    selectedTenant.value = tenant;
    dialog.value = true;
};

const formattedTenants = computed(() => {
    return tenants.value.map((tenant) => ({
        ...tenant,
        room_id: tenant.room_id ? tenant.room_id : "No Room Assigned",
    }));
});

// Toggle activation/deactivation
const toggleTenantStatus = async () => {
    if (!selectedTenant.value) return;
    const newStatus = selectedTenant.value.status === "inactive" ? "active" : "inactive";
    try {
        await apiClient.patch(`/tenants/${selectedTenant.value.id}/update`, {
            status: newStatus, // ✅ Toggling status
        }, {
            headers: { "Property-Code": authStore.propertyCode },
        });
        toast.success(`Tenant ${newStatus} successfully!`);
        fetchTenants();
    } catch {
        toast.error(`Failed to ${newStatus} tenant.`);
    } finally {
        showConfirmDialog.value = false;
    }
};

const viewTenant = (tenant: Tenant) => console.log("View tenant details:", tenant);

const actions = [
    { name: "edit", icon: "mdi-pencil", color: "orange", handler: editTenant },
    { name: "toggle-status", icon: "mdi-key", color: "red", handler: confirmDeactivation },
    { name: "view", icon: "mdi-eye", color: "green", handler: viewTenant },
];

const refreshTenants = () => {
    fetchTenants();
};

onMounted(fetchTenants);
</script>
