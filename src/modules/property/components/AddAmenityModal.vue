<template>
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="text-h5">{{ formData.id ? 'Edit Amenity' : 'Add Amenity' }}</v-card-title>

            <v-card-text v-simplebar style="max-height: 400px; overflow-y: auto;">
                <v-form ref="form">
                    <v-select v-model="formData.category_id" label="Room Category" :items="categories"
                        item-title="label" item-value="id" required variant="outlined"></v-select>
                    <v-text-field v-model="formData.label" label="Amenity" required variant="outlined"></v-text-field>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="formData.size.width" label="Width" variant="outlined"
                                type="number"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="formData.size.height" label="Height" variant="outlined"
                                type="number"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-select v-model="formData.size.unit" label="Size Unit" :items="['cm', 'm', 'in', 'ft']"
                        variant="outlined"></v-select>
                    <v-menu v-model="colorPickerMenu" :close-on-content-click="false" transition="scale-transition"
                        offset-y max-width="290px" min-width="290px">
                        <template v-slot:activator="{ props }">
                            <v-text-field v-model="formData.color" label="Color" prepend-icon="mdi-palette" readonly
                                v-bind="props" v-on="props"></v-text-field>
                        </template>
                        <v-card>
                            <v-color-picker v-model="formData.color" flat hide-canvas show-swatches></v-color-picker>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text="true" color="primary" @click="colorPickerMenu = false">Close</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
                    <v-select
                        v-model="formData.condition"
                        label="Condition"
                        :items="['New', 'Good', 'Fair', 'Poor']"
                        variant="outlined"
                    ></v-select>
                    <v-textarea v-model="formData.description" label="Description" variant="outlined"></v-textarea>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-btn color="red" @click="closeDialog">Cancel</v-btn>
                <v-btn color="green" :loading="loading" @click="submitAmenity">{{ formData.id ? 'Update' : 'Save'
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

const props = defineProps<{ modelValue: boolean; amenity?: any }>();
const emit = defineEmits(["update:modelValue", "amenity-added", "amenity-updated"]);

const authStore = useAuthStore();
const toast = useToast();
const form = ref<HTMLFormElement | null>(null);
const loading = ref(false);
const colorPickerMenu = ref(false);

const dialog = computed({
    get: () => props.modelValue,
    set: (value) => {
        if (!value) resetForm(); // Reset form when closing modal
        emit("update:modelValue", value);
    },
});

const categories = ref<Array<{ id: number; label: string }>>([]);

const defaultFormData = () => ({
    id: null,
    category_id: null, // Ensure this is defined
    label: "",
    size: { width: "", height: "", unit: "" },
    color: "",
    condition: "",
    description: "",
});


const formData = ref(defaultFormData());

// Watch for changes and prefill the form
watch(
    () => props.amenity,
    (newAmenity) => {
        if (newAmenity) {
            formData.value = {
                ...newAmenity,
            };
        } else {
            formData.value = defaultFormData();
        }
    },
    { immediate: true }
);

const fetchCategories = async () => {
    if (!authStore.propertyCode) {
        console.error("Property Code is missing!");
        return;
    }

    try {
        const response = await apiClient.get("/room-categories", {
            headers: { "Property-Code": authStore.propertyCode },
        });
        categories.value = response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load room categories.");
    }
};

const submitAmenity = async () => {
    if (!form.value) return;

    const { valid } = await form.value.validate();
    if (!valid) return;

    if (!authStore.propertyCode) {
        toast.error("Missing Property Code. Please try again.");
        return;
    }

    loading.value = true;

    try {
        // Format the size field as a single string
        const formattedSize = formData.value.size.width && formData.value.size.height
            ? `${formData.value.size.width} by ${formData.value.size.height} ${formData.value.size.unit}`
            : "";

        // Create a copy of formData with the formatted size
        const payload = {
            ...formData.value,
            size: formattedSize, // Overwrite size with formatted string
        };

        if (formData.value.id) {
            // Update existing amenity
            await apiClient.put(`/amenities/${formData.value.id}`, payload, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Amenity updated successfully!");
            emit("amenity-updated");
        } else {
            // Create new amenity
            await apiClient.post("/amenities", payload, {
                headers: { "Property-Code": authStore.propertyCode },
            });
            toast.success("Amenity added successfully!");
            emit("amenity-added");
        }

        closeDialog();
    } catch (error) {
        console.error("Error saving amenity:", error);
        toast.error("Failed to save amenity. Please try again.");
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

onMounted(fetchCategories);
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