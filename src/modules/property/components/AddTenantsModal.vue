<template>
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="text-h5">{{ formData.id ? 'Edit Tenant' : 'Add Tenant' }}</v-card-title>

            <v-card-text style="max-height: 400px; overflow-y: auto;">
                <v-form ref="form">
                    <v-text-field v-model="formData.name" label="Tenant Full name" required
                        variant="outlined"></v-text-field>

                    <v-text-field v-model="formData.email" label="Email" type="email" required variant="outlined"
                        @input="formData.email = formData.email"></v-text-field>

                    <v-text-field v-model="formData.phone" label="Phone Number" variant="outlined"></v-text-field>

                    <v-select v-model="formData.room_id" label="Room" :items="rooms" item-title="label" item-value="id"
                        required variant="outlined"></v-select>

                    <v-text-field v-model="formData.password" label="Password" type="password" required
                        variant="outlined" @input="formData.password = formData.password"></v-text-field>

                    <v-switch v-model="formData.status" label="Active?" inset
                        :color="formData.status === 'active' ? 'red' : 'green'" />
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-btn color="red" @click="closeDialog">Cancel</v-btn>
                <v-btn color="green" :loading="loading" @click="submitTenant">{{ formData.id ? 'Update' : 'Save'
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

const props = defineProps<{ modelValue: boolean; tenant?: any }>();
const emit = defineEmits(["update:modelValue", "tenant-added", "tenant-updated"]);
const rooms = ref<Array<{ id: number; label: string }>>([]);

const authStore = useAuthStore();
const toast = useToast();
const form = ref<HTMLFormElement | null>(null);
const loading = ref(false);

const dialog = computed({
    get: () => props.modelValue,
    set: (value) => {
        if (!value) resetForm(); // Reset form when closing modal
        emit("update:modelValue", value);
    },
});

const defaultFormData = () => ({
    id: null,
    name: "",
    email: "",
    phone: "",
    room_id: null,
    password: "",
    status: "active" as string | null,
});

const formData = ref(defaultFormData());

// Watch for changes and prefill the form
watch(
    () => props.tenant,
    (newTenant) => {
        if (newTenant) {
            formData.value = {
                ...newTenant,
                status: Boolean(newTenant.status),
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

const submitTenant = async () => {
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
            // Update existing tenant
            await apiClient.patch(`/tenants/${formData.value.id}/update`, formData.value, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Tenant updated successfully!");
            emit("tenant-updated");
        } else {
            // Create new tenant
            await apiClient.post("/property_users/register", formData.value, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Tenant added successfully!");
            emit("tenant-added");
        }

        closeDialog();
    } catch (error) {
        console.error("Error saving tenant:", error);
        toast.error("Failed to save tenant. Please try again.");
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