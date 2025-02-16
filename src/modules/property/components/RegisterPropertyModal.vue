<template>
    <v-dialog :model-value="props.dialog" max-width="800px" @update:model-value="emit('update:dialog', $event)">
        <v-card>
            <v-card-title>
                <span class="text-h5">Register New Property</span>
            </v-card-title>
            <v-card-text>
                <v-stepper v-model="step"
                    :items="['Admin Details', 'Property Details', 'Setup Password', 'Confirmation']">
                    <template v-slot:item.1>
                        <v-card title="Admin Details" flat>
                            <v-card-text>
                                <v-text-field v-model="form.name" label="Full Name" required
                                    variant="outlined"></v-text-field>
                                <v-text-field v-model="form.email" label="Email Address" required
                                    variant="outlined"></v-text-field>
                                <v-text-field v-model="form.phone" label="Phone Number" required
                                    variant="outlined"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </template>

                    <template v-slot:item.2>
                        <v-card title="Property Details" flat>
                            <v-card-text>
                                <v-text-field v-model="form.property_name" label="Property Name" required
                                    variant="outlined"></v-text-field>
                                <v-text-field v-model="form.property_address" label="Property Address" required
                                    variant="outlined"></v-text-field>
                                <v-file-input label="KYC Upload" @change="handleFileUpload"
                                    variant="outlined"></v-file-input>
                            </v-card-text>
                        </v-card>
                    </template>

                    <template v-slot:item.3>
                        <v-card title="Setup Password" flat>
                            <v-card-text>
                                <v-text-field v-model="form.password" label="Password" type="password" required
                                    variant="outlined"></v-text-field>
                                <v-text-field v-model="form.password_confirmation" label="Confirm Password"
                                    type="password" required variant="outlined"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </template>

                    <template v-slot:item.4>
                        <v-card title="Confirmation" flat>
                            <v-table>
                                <tbody>
                                    <tr>
                                        <td><strong>Name:</strong></td>
                                        <td>{{ form.name }}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email:</strong></td>
                                        <td>{{ form.email }}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Phone:</strong></td>
                                        <td>{{ form.phone }}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Property Name:</strong></td>
                                        <td>{{ form.property_name }}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Property Address:</strong></td>
                                        <td>{{ form.property_address }}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>KYC Document:</strong></td>
                                        <td>{{ form.kyc ? form.kyc.name : 'Not uploaded' }}</td>
                                    </tr>
                                </tbody>
                            </v-table>
                            <v-card-actions>
                                <v-btn color="green" variant="outlined" @click="submitForm">Submit</v-btn>
                            </v-card-actions>
                        </v-card>
                    </template>
                </v-stepper>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import apiClient from '@/services/apiClient'
import { useToast } from "vue-toastification";

const toast = useToast();

const props = defineProps({
    dialog: Boolean,
});
const emit = defineEmits(['update:dialog']);

const step = ref(1);
const form = ref({
    name: '',
    email: '',
    phone: '',
    property_name: '',
    property_address: '',
    kyc: null,
    password: '',
    password_confirmation: '',
});

const handleFileUpload = (event) => {
    form.value.kyc = event.target.files[0] || null;
};


const submitForm = async () => {
    try {
        const formData = new FormData();
        Object.keys(form.value).forEach((key) => {
            formData.append(key, form.value[key]);
        });

        await apiClient.post('/register', formData);
        toast.success("Property registered successfully!", {
            position: "top-right",
            timeout: 3000,
        });
        emit('update:dialog', false);
    } catch (error) {
        console.error(error);

        if (error.response) {
            // API responded with an error
            if (error.response.status === 422) {
                // Validation errors
                const validationErrors = error.response.data.errors;
                let errorMessages = Object.values(validationErrors).flat().join('\n');
                toast.warning(`Validation Error:\n${errorMessages}`, {
                    position: "top-right",
                    timeout: 3000,
                });
            } else {
                // Other API errors
                toast.error(`Error: ${error.response.data.error || 'Failed to register property.'}`, {
                    position: "top-right",
                    timeout: 3000,
                });
            }
        } else if (error.request) {
            // Request was made but no response received
            toast.error('Network error: Unable to reach the server. Please check your connection.', {
                position: "top-right",
                timeout: 3000,
            });
        } else {
            // Other unexpected errors
            toast.error(`Unexpected error: ${error.message}`, {
                position: "top-right",
                timeout: 3000,
            });
        }
    }
};

</script>