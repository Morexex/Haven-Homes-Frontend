<template>
    <HeaderTitle title="Vacation History" searchPlaceholder="Search Vacation" showSearch
        :buttons="[{ text: 'Apply Vacation', event: 'apply-vacation', color: 'green', icon: '' }]"
        @update:search="updateSearchQuery" @button-click="applyVacation" />

    <TableComponent title="Vacation History" :headers="headers" :items="vacations" :actions="actions"
        :loading="loading" />

    <!-- Confirmation Dialog -->
    <ConfirmDialog v-model="showConfirmDialog" :title="confirmDialogTitle" :message="confirmDialogMessage"
        :confirmText="confirmDialogButtonText" cancelText="Cancel" @confirm="applyVacation" />

    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title>
                <span class="text-h6">Apply for Vacation</span>
            </v-card-title>

            <v-card-text>
                <v-form ref="vacationForm" lazy-validation>
                    <v-select v-model="form.room" :items="rooms" item-value="id" item-title="label" label="Select Room"
                        :rules="[v => !!v || 'Room is required']" variant="outlined" />

                    <v-textarea v-model="form.reason" label="Reason" :rules="[v => !!v || 'Reason is required']"
                        variant="outlined" />

                    <v-text-field v-model="form.proposed_vacation_date" label="Proposed Vacation Date" type="date"
                        :rules="[v => !!v || 'Proposed date is required']" variant="outlined" />
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
                <v-btn color="green" @click="submitVacation">Apply</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialogApprove" max-width="600px">
        <v-card>
            <v-card-title>
                <span class="text-h6">Approve Vacation</span>
            </v-card-title>

            <v-card-text>
                <v-form ref="vacationForm" lazy-validation>
                    <div class="mb-4">
                        <div><strong>Room:</strong> {{ selectedVacation?.room_name }}</div>
                        <div><strong>Tenant:</strong> {{ selectedVacation?.tenant_name }}</div>
                    </div>

                    <v-text-field v-model="form.actual_vacation_date" label="Actual Vacation Date" type="date"
                        :rules="[v => !!v || 'Actual Vacation date is required']" variant="outlined" />
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="dialogApprove = false">Cancel</v-btn>
                <v-btn color="green" @click="handleApproveStatus">Apply</v-btn>
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

interface Vacation {
    id: number;
    tenant_name: string;
    reason: string;
    room_name: string;
    status: string;
    formatted_application_date: string;
    proposed_vacation_date: string;
    room_id: string;
}

interface Room {
    id: number | string;
    label: string;
    floor: string;
    quantity: number;
    description: string;
    is_vacant: boolean;
}

const form = ref({
    id: 0,
    room: '',
    reason: '',
    proposed_vacation_date: '',
    actual_vacation_date: '',
});

const vacationForm = ref();

const router = useRouter();
const searchQuery = ref("");
const authStore = useAuthStore();
const dialog = ref(false);
const dialogApprove = ref(false);
const vacations = ref<Vacation[]>([]);
const toast = useToast();
const loading = ref(false);
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogMessage = ref("");
const confirmDialogButtonText = ref("");
const selectedVacation = ref<Vacation | null>(null);
const rooms = ref<Room[]>([]);
const userId = computed(() => authStore.user?.id);

// Open Add Tenant Modal
const applyVacation = (vacation: Vacation) => {
    selectedVacation.value = vacation;

    form.value = {
        id: vacation.id,
        room: vacation.room_id,
        reason: vacation.reason,
        proposed_vacation_date: vacation.proposed_vacation_date,
        actual_vacation_date: '',
    };

    dialogApprove.value = true;
};

const submitVacation = async () => {

    try {
        const payload = {
            id: form.value.id,
            room_id: form.value.room,
            reason: form.value.reason,
            proposed_vacation_date: form.value.proposed_vacation_date,
            tenant_id: userId.value,
        };

        if (payload.id !== 0) {
            // Update existing tenant
            await apiClient.put(`/vacations/${payload.id}`, payload, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Vacancy updated successfully!");
        } else {
            await apiClient.post("/vacations", payload, {
                headers: { "Property-Code": authStore.propertyCode },
            });
        }
        dialog.value = false;
        fetchVacationHistory();
    } catch (error) {
        toast.error('Failed to apply for vacation.');
        console.error(error);
    }
};


const updateSearchQuery = (query: string) => {
    searchQuery.value = query;
};

// Show confirmation dialog before toggling activation
const confirmApproval = (vacation: Vacation) => {
    selectedVacation.value = vacation;
    confirmDialogMessage.value = `Are you sure you want to Approve this vacation?`;
    showConfirmDialog.value = true;
    confirmDialogButtonText.value = `Approve`;
    confirmDialogTitle.value = `Confirm Approval`
};

const handleApproveStatus = async () => {

    try {
        const payload = {
            id: form.value.id,
            room_id: form.value.room,
            reason: form.value.reason,
            proposed_vacation_date: form.value.proposed_vacation_date,
            tenant_id: userId.value,
        };

        if (payload.id !== 0) {
            // Update existing tenant
            await apiClient.put(`/vacations/${payload.id}`, payload, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Vacancy updated successfully!");
        } else {
            await apiClient.post("/vacations", payload, {
                headers: { "Property-Code": authStore.propertyCode },
            });
        }
        dialog.value = false;
        fetchVacationHistory();
    } catch (error) {
        toast.error('Failed to apply for vacation.');
        console.error(error);
    }
};

const headers = [
    { text: "ID", value: "id", sortable: false },
    { text: "Tenant", value: "tenant_name" },
    { text: "Room", value: "room_name" },
    { text: "Reason For Vaction", value: "reason" },
    { text: "Status", value: "status" },
    { text: "Proposed Vacation Date", value: "proposed_vacation_date_formatted" },
    { text: "Application Date", value: "formatted_application_date" },
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
        vacations.value = data;
        console.log(vacations.value)

    } catch (error) {
        toast.error("Failed to load vacation history.");
        console.error("Fetch error:", error);
    } finally {
        loading.value = false;
    }
};


//fetch rooms belonging to this user and have the agreements submitted.
const fetchRooms = async () => {
    loading.value = true;
    if (!authStore.propertyCode) return;
    try {
        const { data } = await apiClient.get("/rooms", {
            headers: { "Property-Code": authStore.propertyCode },
        });
        rooms.value = data;
    } catch {
        toast.error("Failed to load rooms.");
    } finally {
        loading.value = false;
    }
};

const editVacation = (vacation: Vacation) => {
    selectedVacation.value = vacation;

    form.value = {
        id: vacation.id,
        room: vacation.room_id,
        reason: vacation.reason,
        proposed_vacation_date: vacation.proposed_vacation_date,
        actual_vacation_date: '',
    };

    dialog.value = true;
};

// Navigate to ViewUserPage.vue with tenant details
const viewVacation = (vacation: Vacation) => {

};

const actions = [
    { name: "Edit", icon: "mdi-pencil", color: "orange", handler: editVacation },
    { name: "Approve", icon: "mdi-check", color: "red", handler: confirmApproval },
    { name: "View", icon: "mdi-eye", color: "green", handler: viewVacation },
];

const refreshVacation = () => {
    fetchVacationHistory();
};

onMounted(() => {
    fetchVacationHistory();
    fetchRooms();
});

</script>
