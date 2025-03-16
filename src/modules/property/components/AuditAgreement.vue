    <template>
        <v-container class="audit-agreement-container">
            <v-card class="audit-agreement-card pa-6 rounded-lg elevation-3">
                <!-- Title and Close Button -->
                <v-card-title class="title d-flex justify-space-between align-center">
                    <span>Audit Agreement</span>
                    <v-btn icon @click="closeAgreement">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-subtitle class="subtitle">Review and validate the agreement details</v-card-subtitle>

                <!-- Room Details -->
                <v-card class="section-card my-4 pa-4 rounded-lg elevation-2">
                    <v-card-title>Room Details</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="room.label" label="Room Label" readonly
                                    variant="outlined"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="room.description" label="Description" readonly
                                    variant="outlined"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="room.floor" label="Floor" readonly
                                    variant="outlined"></v-text-field>
                            </v-col>
                            <v-row justify="end">
                                <v-col cols="12" md="1">
                                    <v-switch v-model="roomAgreement" hide-details
                                        :color="roomAgreement ? 'green' : 'grey'">
                                    </v-switch>
                                </v-col>
                            </v-row>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- Charges Breakdown -->
                <v-card class="section-card my-4 pa-4 rounded-lg elevation-2">
                    <v-card-title>Charges Breakdown</v-card-title>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>Charge Type</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Agree?</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="charge in room.agreements?.charges_agreement?.length ? room.agreements.charges_agreement : room.room_charges"
                                    :key="charge.id || charge.charge_type">
                                    <td>{{ charge.charge_type }}</td>
                                    <td>{{ charge.description || 'N/A' }}</td>
                                    <td>{{ charge.amount }}</td>
                                    <td>
                                        <v-switch v-if="room.agreements?.charges_agreement?.length" v-model="chargeAgreeModel[charge.id || charge.charge_type]"
                                            :color="chargeAgreeModel[charge.id || charge.charge_type] ? 'green' : 'grey'"
                                            @change="toggleChargeAgree(charge.id || charge.charge_type)" hide-details>
                                        </v-switch>
                                        <v-switch v-else v-model="charge.id"
                                            :color="charge.id ? 'green' : 'grey'" hide-details>
                                        </v-switch>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2"><strong>Total Charges</strong></td>
                                    <td><strong>{{ room.total_charges }}</strong></td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>


                <!-- Amenities -->
                <v-card class="section-card my-4 pa-4 rounded-lg elevation-2">
                    <v-card-title>Room Amenities</v-card-title>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>Amenity</th>
                                    <th>Description</th>
                                    <th>Size</th>
                                    <th>Color</th>
                                    <th>Condition</th>
                                    <th>Agree?</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="amenity in room.rooms_amenities" :key="amenity.id">
                                    <td>{{ amenity.label }}</td>
                                    <td>{{ amenity.description || 'N/A' }}</td>
                                    <td>{{ amenity.size || 'N/A' }}</td>
                                    <td>{{ amenity.color || 'N/A' }}</td>
                                    <td>{{ amenity.condition }}</td>
                                    <td v-for="amenity in room.agreements?.amenities_agreement?.length ? room.agreements.amenities_agreement : room.rooms_amenities"
                                        :key="amenity.id">
                                        <v-switch v-if="room.agreements?.amenities_agreement?.length" v-model="amenityAgreeModel[amenity.id]"
                                            :color="amenityAgreeModel[amenity.id] ? 'green' : 'grey'"
                                            @change="toggleAmenityAgree(amenity.id)" hide-details>
                                        </v-switch>
                                        <v-switch v-else v-model="amenity.id"
                                            :color="amenity.id ? 'green' : 'grey'" hide-details>
                                        </v-switch>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>

                <!-- Tenant Details -->
                <v-card class="section-card my-4 pa-4 rounded-lg elevation-2">
                    <v-card-title>Tenant Details</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="room.user.name" label="Tenant Name" readonly
                                    variant="outlined"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="room.user.email" label="Email" readonly
                                    variant="outlined"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="room.user.phone" label="Phone" readonly
                                    variant="outlined"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- ID Upload Section -->
                <v-card class="section-card my-4 pa-4 rounded-lg elevation-2">
                    <v-card-title>Upload ID Photos</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-file-input label="ID Front" accept="image/*" variant="outlined"
                                    @change="handleFileUpload($event, 'front')">
                                </v-file-input>

                                <v-img v-if="idFrontPreview" :src="idFrontPreview" class="preview-image mt-2">
                                </v-img>

                                <v-img v-if="!idFrontPreview && room.agreements?.id_front_url"
                                    :src="room.agreements?.id_front_url" class="preview-image mt-2">
                                </v-img>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-file-input label="ID Back" accept="image/*" variant="outlined"
                                    @change="handleFileUpload($event, 'back')">
                                </v-file-input>

                                <v-img v-if="idBackPreview" :src="idBackPreview" class="preview-image mt-2">
                                </v-img>

                                <v-img v-if="!idBackPreview && room.agreements?.id_back_url"
                                    :src="room.agreements?.id_back_url" class="preview-image mt-2">
                                </v-img>
                            </v-col>

                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- Payment & Dates -->
                <v-card class="section-card my-4 pa-4 rounded-lg elevation-2">
                    <v-card-title>Agreement Terms</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="paymentDate" :value="formatDate(room.agreements?.payment_date) || paymentDate"
                                    label="Payment Date" type="date" variant="outlined"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="tenancyStartDate"
                                    :value="formatDate(room.agreements?.payment_date) || tenancyStartDate" label="Proposed Start Date"
                                    type="date" variant="outlined"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- Actions -->
                <v-card-actions class="d-flex justify-end">
                    <v-btn :loading="loading" color="primary" @click="submitAgreement">
                        {{ loading ? 'Submitting...' : 'Submit Agreement' }}
                    </v-btn>
                </v-card-actions>

                <!-- Alerts -->
                <v-alert v-if="errorMessage" type="error" class="mt-2">{{ errorMessage }}</v-alert>
                <v-alert v-if="successMessage" type="success" class="mt-2">{{ successMessage }}</v-alert>
            </v-card>
        </v-container>
    </template>

<script setup>
import { ref, onMounted, defineProps, computed, watchEffect } from "vue";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import { useRoute, useRouter } from "vue-router";

const authStore = useAuthStore();
const props = defineProps(["roomId"]);

const room = ref({
    user: { name: "", email: "", phone: "" }, // Ensure `user` exists by default
    rooms_amenities: []
});
const paymentDate = ref("");
const tenancyStartDate = ref("");
const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const router = useRouter();

// Function to format ISO date to YYYY-MM-DD
const formatDate = (isoDate) => {
    if (!isoDate) return ''; // Return empty if no date is provided
    return isoDate.split('T')[0]; // Extracts only the YYYY-MM-DD part
};
const roomAgreement = computed({
    get() {
        return room.value.agreements?.room_agreement === 'yes';
    },
    set(value) {
        if (!room.value.agreements) {
            room.value.agreements = {};
        }
        room.value.agreements.room_agreement = value ? 'yes' : 'no'; // Ensure correct value type
    }
});

const amenityAgreeModel = computed({
    get() {
        return room.value.agreements?.amenities_agreement?.reduce((acc, amenity) => {
            acc[amenity.id] = amenity.agree === "yes";
            return acc;
        }, {}) || {};
    },
    set(newValues) {
        if (!room.value.agreements) {
            room.value.agreements = {};
            room.value.agreements.amenities_agreement = [];
        }
        Object.keys(newValues).forEach((id) => {
            const amenity = room.value.agreements.amenities_agreement?.find(a => a.id == id);
            if (amenity) {
                amenity.agree = newValues[id] ? "yes" : "no";
            }
        });
    }
});

const chargeAgreeModel = computed({
    get() {
        if (!room.value.agreements?.charges_agreement) {
            return room.value.room_charges.reduce((acc, charge) => {
                acc[charge.id || charge.charge_type] = false;
                return acc;
            }, {});
        }
        return room.value.agreements.charges_agreement.reduce((acc, charge) => {
            acc[charge.id || charge.charge_type] = charge.agree === "yes";
            return acc;
        }, {});
    },
    set(newValues) {
        if (!room.value.agreements) {
            room.value.agreements = {}; // Initialize if not already present
            room.value.agreements.charges_agreement = []; // Initialize the charges array if needed
        }
        Object.keys(newValues).forEach((key) => {
            const charge = room.value.agreements.charges_agreement?.find(c => c.id === key || c.charge_type === key);
            if (charge) {
                charge.agree = newValues[key] ? "yes" : "no";
            }
        });
    }
});

watchEffect(() => {
    // Sync amenities
    if (room.value.agreements?.amenities_agreement) {
        amenityAgreeModel.value = room.value.agreements.amenities_agreement.reduce((acc, amenity) => {
            acc[amenity.id] = amenity.agree === "yes";
            return acc;
        }, {});
    }

    // Sync charges
    if (room.value.agreements?.charges_agreement) {
        chargeAgreeModel.value = room.value.agreements.charges_agreement.reduce((acc, charge) => {
            acc[charge.id || charge.charge_type] = charge.agree === "yes";
            return acc;
        }, {});
    }
});

// Update room.agreements when user toggles switch
const toggleAmenityAgree = (id) => {
    const amenity = room.value.agreements?.amenities_agreement?.find(a => a.id == id);
    if (amenity) {
        amenity.agree = amenityAgreeModel.value[id] ? "yes" : "no";
    }
};

const toggleChargeAgree = (idOrType) => {
    const charge = room.value.agreements?.charges_agreement?.find(c => c.id == idOrType || c.charge_type == idOrType);
    if (charge) {
        charge.agree = chargeAgreeModel.value[idOrType] ? "yes" : "no";
    }
};

// ID File Upload State
const idFront = ref(null);
const idBack = ref(null);
const idFrontPreview = ref("");
const idBackPreview = ref("");

// Fetch Room Details
const fetchRoomDetails = async () => {
    try {
        const { data } = await apiClient.get(`/rooms/${props.roomId}`, {
            headers: { "Property-Code": authStore.propertyCode },
        });
        room.value = data.room_details;
    } catch (error) {
        errorMessage.value = `Failed to fetch room details: ${error.message}`;

    }
};
// Handle File Upload
const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
        // Create a URL for the selected image to be used as a preview
        const imageUrl = URL.createObjectURL(file);

        if (type === "front") {
            idFront.value = file;  // Store the file for later use (e.g., upload)
            idFrontPreview.value = imageUrl;  // Set the preview for the front image
        } else if (type === "back") {
            idBack.value = file;  // Store the file for later use (e.g., upload)
            idBackPreview.value = imageUrl;  // Set the preview for the back image
        }
    }
};

// Submit Agreement
const submitAgreement = async () => {
    loading.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
        const formData = new FormData();

        // Append general fields
        formData.append("payment_date", paymentDate.value);
        formData.append("tenancy_start_date", tenancyStartDate.value);
        formData.append("property_code", authStore.propertyCode);
        formData.append("room_id", room.value.id);

        // Append tenant details
        formData.append("tenant_name", room.value.user.name);
        formData.append("tenant_email", room.value.user.email);
        formData.append("tenant_phone", room.value.user.phone);

        // Append room agreement status
        formData.append("room_agreement", room.value.agree ? "yes" : "no");

        // Append charges along with their agreement status
        room.value.room_charges.forEach((charge, index) => {
            formData.append(`charges_agreement[${index}][charge_type]`, charge.charge_type);
            formData.append(`charges_agreement[${index}][amount]`, charge.amount);
            formData.append(`charges_agreement[${index}][agree]`, charge.agree ? "yes" : "no");
        });

        // Append amenities agreement status
        room.value.rooms_amenities.forEach((amenity, index) => {
            formData.append(`amenities_agreement[${index}][id]`, amenity.label);
            formData.append(`amenities_agreement[${index}][agree]`, amenity.agree ? "yes" : "no");
        });

        // Append image files if available
        if (idFront.value) {
            formData.append("id_front", idFront.value);
        }
        if (idBack.value) {
            formData.append("id_back", idBack.value);
        }

        // Determine if we should update or create a new agreement
        const agreementId = room.value.agreements?.id;
        let apiEndpoint = "/agreements";
        let method = "post";

        if (agreementId) {
            apiEndpoint = `/agreements/${agreementId}`;
            method = "post";
            formData.append('_method', 'PUT');
        }

        await apiClient[method](apiEndpoint, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Property-Code": authStore.propertyCode,
            },
        });

        successMessage.value = "Agreement submitted successfully!";
        // router.push("/agreements"); // Redirect after success
    } catch (error) {
        errorMessage.value = "Failed to submit agreement.";
    } finally {
        loading.value = false;
    }
};


// Close Agreement
const closeAgreement = () => {
    router.back();
};

// Load Data
onMounted(() => {
    fetchRoomDetails();
});
</script>

<style scoped>
.audit-agreement-container {
    max-width: 1200px;
    margin: auto;
}

.section-card {
    background: #f9f9f9;
}

.v-card-title {
    font-weight: bold;
}

.v-btn {
    text-transform: none;
}

.audit-agreement-container {
    max-width: 1200px;
    margin: auto;
}

.section-card {
    background: #f9f9f9;
}

.preview-image {
    max-width: 100%;
    max-height: 150px;
    border-radius: 5px;
    border: 1px solid #ddd;
}
</style>
