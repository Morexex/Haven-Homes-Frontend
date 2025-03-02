<template>
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="text-h5">{{ formData.id ? 'Edit Staff' : 'Add Staff' }}</v-card-title>

            <v-card-text style="max-height: 400px; overflow-y: auto;">
                <v-form ref="form">
                    <v-text-field v-model="formData.name" label="Staff Full name" required
                        variant="outlined"></v-text-field>

                    <v-text-field v-model="formData.email" label="Email" type="email" required variant="outlined"
                        @input="formData.email = formData.email"></v-text-field>

                    <v-text-field v-model="formData.phone" label="Phone Number" variant="outlined"></v-text-field>

                    <v-text-field v-model="formData.password" label="Password" type="password" required
                        variant="outlined" @input="formData.password = formData.password"></v-text-field>

                    <v-switch v-model="formData.status" label="Active?" inset
                        :color="formData.status === 'active' ? 'red' : 'green'" />
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-btn color="red" @click="closeDialog">Cancel</v-btn>
                <v-btn color="green" :loading="loading" @click="submitStaff">{{ formData.id ? 'Update' : 'Save'
                    }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "vue-toastification";

const props = defineProps<{ modelValue: boolean; staff: any }>();
const emit = defineEmits(["update:modelValue", "staff-added", "staff-updated"]);

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
    password: "",
    room_id: null,
    status: "active" as string | null,
    role: "staff"
});

const formData = ref(defaultFormData());

// Watch for changes and prefill the form
watch(
    () => props.staff,
    (newStaff) => {
        if (newStaff) {
            formData.value = {
                ...newStaff,
                status: Boolean(newStaff.status),
                room_id: null,
            };
        } else {
            formData.value = defaultFormData();
        }
    },
    { immediate: true }
);

const submitStaff = async () => {
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
            // Update existing staff
            await apiClient.patch(`/tenants/${formData.value.id}/update`, formData.value, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Staff updated successfully!");
            emit("staff-updated");
        } else {
            // Create new staff
            await apiClient.post("/property_users/register", formData.value, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Staff added successfully!");
            emit("staff-added");
        }

        closeDialog();
    } catch (error) {
        console.error("Error saving staff:", error);
        toast.error("Failed to save staff. Please try again.");
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