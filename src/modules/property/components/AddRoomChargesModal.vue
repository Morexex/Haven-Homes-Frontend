<template>
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="text-h5">{{ formData.id ? 'Edit Charges' : 'Add Charges' }}</v-card-title>

            <v-card-text v-simplebar style="max-height: 400px; overflow-y: auto;">
                <v-form ref="form">
                    <v-select v-model="formData.room_id" label="Room" :items="rooms" item-title="label" item-value="id"
                        required variant="outlined"></v-select>
                    <v-select v-model="formData.charge_type"
                        :items="['Rent', 'Deposit', 'Water Bill', 'Electricity Bill', 'Other Bills']"
                        label="Charge Type" required variant="outlined" />
                    <v-text-field v-model="formData.amount" label="Amount" type="number" required
                        variant="outlined"></v-text-field>
                    <v-textarea v-model="formData.description" label="Description" variant="outlined"></v-textarea>
                    <v-text-field v-model="formData.effective_date" label="Effective Date" type="date"
                        variant="outlined"></v-text-field>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-btn color="red" @click="closeDialog">Cancel</v-btn>
                <v-btn color="green" :loading="loading" @click="submitCharge">{{ formData.id ? 'Update' : 'Save'
                    }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "vue-toastification";

const props = defineProps<{ modelValue: boolean; charge?: any }>();
const emit = defineEmits(["update:modelValue", "charge-added", "charge-updated"]);

const authStore = useAuthStore();
const toast = useToast();
const form = ref<HTMLFormElement | null>(null);
const loading = ref(false);
interface Room {
    id: number;
    label: string;
}

const rooms = ref<Room[]>([]);

const dialog = computed({
    get: () => props.modelValue,
    set: (value) => {
        if (!value) resetForm(); // Reset form when closing modal
        emit("update:modelValue", value);
    },
});

const defaultFormData = () => ({
    id: null,
    room_id: null, // Ensure this is defined
    charge_type: "",
    amount: "",
    description: "",
    effective_date: new Date().toISOString().substr(0, 10)
});


const formData = ref({
    ...defaultFormData()
});

// Watch for changes and prefill the form
watch(
    () => props.charge,
    (newCharge) => {
        if (newCharge) {
            formData.value = {
                ...newCharge,
            };
        } else {
            formData.value = defaultFormData();
        }
    },
    { immediate: true }
);

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

const submitCharge = async () => {
    if (!form.value) return;

    const { valid } = await form.value.validate();
    if (!valid) return;

    if (!authStore.propertyCode) {
        toast.error("Missing Property Code. Please try again.");
        return;
    }

    loading.value = true;

    try {
        if (formData.value.id) {
            // Update existing amenity
            await apiClient.put(`/charges/${formData.value.id}`, formData.value, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Charge updated successfully!");
            emit("charge-updated");
        } else {
            // Create new amenity
            await apiClient.post("/charges", formData.value, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Charge added successfully!");
            emit("charge-added");
        }

        closeDialog();
    } catch (error) {
        console.error("Error saving charge:", error);
        toast.error("Failed to save charge. Please try again.");
    } finally {
        loading.value = false;
    }
};


const closeDialog = () => {
    resetForm();
    emit("update:modelValue", false);
};

const resetForm = () => {
    formData.value = defaultFormData();
};

onMounted(fetchRooms);
</script>

<style scoped>
.image-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.v-card-text {
    max-height: 400px;
    overflow: hidden;
}

.v-card-text::-webkit-scrollbar {
    width: 0px;
    height: 0px;
}

.v-card-text {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>