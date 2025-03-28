<template>
    <HeaderTitle title="Staff" searchPlaceholder="Search Staff" showSearch
        :buttons="[{ text: 'Add Staff', event: 'add-staff', color: 'green', icon: 'plus' }]"
        @update:search="updateSearchQuery" @button-click="addStaff" />
    <TableComponent title="Staff" :headers="headers" :items="formattedStaffs" :actions="actions" :loading="loading" />

    <!-- Register Property Dialog -->
    <AddStaffsModal v-model="dialog" :staff="selectedStaff" @staff-added="refreshStaffs"
        @staff-updated="refreshStaffs" />

    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" :title="confirmDialogTitle" :message="confirmDialogMessage"
        :confirmText="confirmDialogButtonText" cancelText="Cancel" @confirm="toggleTenantStatus" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import HeaderTitle from "@/components/HeaderTitle.vue";
import AddStaffsModal from "./AddStaffsModal.vue";
import TableComponent from "@/components/TableComponent.vue";
import ConfirmDialog from "@/components/ConfirmationDialog.vue";
import { useRouter } from "vue-router";

interface Staff {
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
const staffs = ref<Staff[]>([]);
const toast = useToast();
const loading = ref(false);
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogMessage = ref("");
const confirmDialogButtonText = ref("");
const router = useRouter();

const selectedStaff = ref<Staff | null>(null);

// Open Add Tenant Modal
const addStaff = () => {
    dialog.value = true;
};

const updateSearchQuery = (query: string) => {
    searchQuery.value = query;
};

// Show confirmation dialog before toggling activation
const confirmDeactivation = (staff: Staff) => {
    selectedStaff.value = staff;
    if (staff.status === "inactive") {
        confirmDialogTitle.value = "Confirm Activation";
        confirmDialogMessage.value = `Are you sure you want to activate this staff ${staff.name}?`;
        confirmDialogButtonText.value = "Activate";
    } else {
        confirmDialogTitle.value = "Confirm Deactivation";
        confirmDialogMessage.value = `Are you sure you want to deactivate this staff ${staff.name}?`;
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

const fetchStaffs = async () => {
    loading.value = true;
    if (!authStore.propertyCode) {
        console.warn("Property-Code is missing");
        return;
    }
    try {
        const { data } = await apiClient.get("/staffs", {
            headers: { "Property-Code": authStore.propertyCode },
        });

        console.log("API Response:", data); // Debugging
        staffs.value = Array.isArray(data.staffs) ? data.staffs : []; // ✅ Extract array correctly

    } catch (error) {
        toast.error("Failed to load tenants.");
        console.error("Fetch error:", error);
    } finally {
        loading.value = false;
    }
};


const editStaff = (staff: Staff) => {
    selectedStaff.value = staff;
    dialog.value = true;
};

const formattedStaffs = computed(() => {
    return staffs.value.map((staff) => ({
        ...staff,
        room_id: staff.room_id ? staff.room_id : "No Room Assigned",
    }));
});

// Toggle activation/deactivation
const toggleTenantStatus = async () => {
    if (!selectedStaff.value) return;
    const newStatus = selectedStaff.value.status === "inactive" ? "active" : "inactive";
    try {
        await apiClient.patch(`/tenants/${selectedStaff.value.id}/update`, {
            status: newStatus, // ✅ Toggling status
        }, {
            headers: { "Property-Code": authStore.propertyCode },
        });
        toast.success(`Tenant ${newStatus} successfully!`);
        fetchStaffs();
    } catch {
        toast.error(`Failed to ${newStatus} tenant.`);
    } finally {
        showConfirmDialog.value = false;
    }
};

const viewStaff = (staff: Staff) => {
    router.push({
        name: "ViewUserPage",
        params: { type: "staff" },
        query: {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            role: staff.role,
            room_id: staff.room_id ?? "No Room Assigned",
            status: staff.status
        }
    });
};


const actions = [
    { name: "Edit", icon: "mdi-pencil", color: "orange", handler: editStaff },
    { name: "Change status", icon: "mdi-key", color: "red", handler: confirmDeactivation },
    { name: "View", icon: "mdi-eye", color: "green", handler: viewStaff },
];

const refreshStaffs = () => {
    fetchStaffs();
};

onMounted(fetchStaffs);
</script>
