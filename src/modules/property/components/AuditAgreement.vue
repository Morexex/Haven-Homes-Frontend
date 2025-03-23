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
                            <v-text-field v-model="room.floor" label="Floor" readonly variant="outlined"></v-text-field>
                        </v-col>
                        <v-row justify="end">
                            <v-col cols="12" md="1">
                                <v-switch v-model="roomAgreement" hide-details
                                    :color="roomAgreement ? 'green' : 'grey'">
                                </v-switch>
                            </v-col>
                        </v-row>
                    </v-row>
                    <!-- adda fancy section to write reasons for declining if the user switches no -->
                    <v-row v-if="!roomAgreement" dense>
                        <v-col cols="12">
                            <v-textarea v-model="roomDeclineReason" label="Reason for Declining" variant="outlined"
                                color="red" required></v-textarea>
                        </v-col>
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
                                    <v-switch v-model="chargesAgreement[charge.charge_type || charge.id]"
                                        :color="chargesAgreement[charge.charge_type || charge.id] ? 'green' : 'grey'"
                                        @change="toggleChargeAgree(charge)" hide-details />
                                </td>
                                <td v-if="!chargesAgreement[charge.charge_type || charge.id]" class="pt-6">
                                    <v-textarea v-model="charge.chargeDeclineReason" label="Reason for Declining"
                                        variant="outlined" color="red" required
                                        @input="appendReasonCharge(charge)">
                                    </v-textarea>
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
                            <tr v-for="amenity in room.agreements?.amenities_agreement?.length ? room.agreements.amenities_agreement : room.rooms_amenities"
                                :key="amenity.id || amenity.label">
                                <td>{{ amenity.label }}</td>
                                <td>{{ amenity.description || 'N/A' }}</td>
                                <td>{{ amenity.size || 'N/A' }}</td>
                                <td>{{ amenity.color || 'N/A' }}</td>
                                <td>{{ amenity.condition }}</td>
                                <td>
                                    <v-switch v-model="amenityAgreement[amenity.label || amenity.id]"
                                        :color="amenityAgreement[amenity.label || amenity.id] ? 'green' : 'grey'"
                                        @change="toggleAmenityAgree(amenity)" hide-details />
                                </td>
                                <td v-if="!amenityAgreement[amenity.label || amenity.id]" class="pt-6">
                                    <v-textarea v-model="amenity.amenityDeclineReason" label="Reason for Declining"
                                        variant="outlined" color="red" required
                                        @input="appendReasonAmenity(amenity)"></v-textarea>
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
                            <v-text-field v-model="paymentDate" label="Payment Date" type="date"
                                variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="tenancyStartDate" label="Proposed Start Date" type="date"
                                variant="outlined"></v-text-field>
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
import { ref, onMounted, defineProps } from "vue";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const props = defineProps(["roomId"]);
const toast = useToast();

const room = ref({
    user: { name: "", email: "", phone: "" }, // Ensure `user` exists by default
});
const paymentDate = ref("");
const tenancyStartDate = ref("");
const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const router = useRouter();
const roomAgreement = ref(true);
const roomDeclineReason = ref("");
const amenityAgreement = ref({});
const chargesAgreement = ref({});

// Function to format ISO date to YYYY-MM-DD
const formatDate = (isoDate) => {
    if (!isoDate) return ''; // Return empty if no date is provided
    return isoDate.split('T')[0]; // Extracts only the YYYY-MM-DD part
};

// Function to get the charge agree status
const getChargeAgree = (charge) => {
    if (room.value.agreements?.charges_agreement?.length) {
        return charge.agree === "yes";
    } else {
        return chargesAgreement.value[charge.id] === "yes";
    }
};

const getAmenityAgree = (amenity) => {
    if (room.value.agreements?.amenities_agreement?.length) {
        return amenity.agree === "yes";
    } else {
        return amenityAgreement.value[amenity.id] === "yes";
    }
};

const appendReasonCharge = (charge) => {
    console.log("Before Append:", JSON.stringify(charge.chargeDeclineReason, null, 2));
    if (room.value.agreements?.charges_agreement?.length) {
        const existingCharge = room.value.agreements.charges_agreement.find(
            c => c.id === charge.id || c.charge_type === charge.charge_type
        );
        if (existingCharge) {
            existingCharge.reason = chargesAgreement.value[charge.charge_type || charge.id] === "yes" ? "agreed" : charge.chargeDeclineReason;
        }
    } else {
        room.value.agreements.charges_agreement.push({
            id: charge.id,
            charge_type: charge.charge_type,
            reason: charge.chargeDeclineReason,
        });
    }
    console.log("After Append:", JSON.stringify(charge.chargeDeclineReason, null, 2));
};

const appendReasonAmenity = (amenity) => {
    console.log("Before Append:", JSON.stringify(amenity.amenityDeclineReason, null, 2));
    if (room.value.agreements?.amenities_agreement?.length) {
        const existingAmenity = room.value.agreements.amenities_agreement.find(
            a => a.id === amenity.id || a.label === amenity.label
        );
        if (existingAmenity) {
            existingAmenity.reason = amenityAgreement.value[amenity.label || amenity.id] === "yes" ? "agreed" : amenity.amenityDeclineReason;
        }
    } else {
        room.value.agreements.amenities_agreement.push({
            id: amenity.id,
            label: amenity.label,
            reason: amenity.amenityDeclineReason,
        });
    }
    console.log("After Append:", JSON.stringify(amenity.amenityDeclineReason, null, 2));
}

// Function to toggle charge agreement
const toggleChargeAgree = (charge) => {
    console.log("Before Toggle:", JSON.stringify(chargesAgreement.value, null, 2));

    // Determine new "agree" state: toggle between "yes" and "no"
    const newAgreeValue = getChargeAgree(charge) ? "no" : "yes";

    // Ensure room agreements exist
    if (!room.value.agreements) {
        room.value.agreements = { charges_agreement: [] };
    }

    // If room has charge agreements, update the existing charge
    const existingCharge = room.value.agreements.charges_agreement.find(
        c => c.id === charge.id || c.charge_type === charge.charge_type
    );

    if (existingCharge) {
        existingCharge.agree = newAgreeValue;
    } else {
        // Append new charge if not found
        room.value.agreements.charges_agreement.push({
            id: charge.id,
            charge_type: charge.charge_type,
            description: charge.description,
            amount: charge.amount,
            agree: newAgreeValue,
            reason: charge.chargeDeclineReason,
        });
    }

    // Always ensure the charge's agree property is updated
    charge.agree = newAgreeValue;

    // Sync the chargesAgreement object
    Vue.set(chargesAgreement.value, charge.charge_type || charge.id, newAgreeValue);

    console.log("After Toggle:", JSON.stringify(chargesAgreement.value, null, 2));
};

const toggleAmenityAgree = (amenity) => {
    console.log("Before Toggle:", JSON.stringify(amenityAgreement.value, null, 2));

    // Determine new "agree" state: toggle between "yes" and "no"
    const newAgreeValue = getAmenityAgree(amenity) ? "no" : "yes";

    // Ensure room agreements exist
    if (!room.value.agreements) {
        room.value.agreements = { amenities_agreement: [] };
    }

    // If room has amenity agreements, update the existing amenity
    const existingAmenity = room.value.agreements.amenities_agreement.find(
        a => a.id === amenity.id || a.label === amenity.label
    );

    if (existingAmenity) {
        existingAmenity.agree = newAgreeValue;
    } else {
        // Append new amenity if not found
        room.value.agreements.amenities_agreement.push({
            id: amenity.id,
            label: amenity.label,
            description: amenity.description,
            size: amenity.size,
            color: amenity.color,
            condition: amenity.condition,
            agree: newAgreeValue,
            reason: amenity.amenityDeclineReason,
        });
    }

    // Always ensure the amenity's agree property is updated
    amenity.agree = newAgreeValue;

    // Sync the amenityAgreement object
    Vue.set(amenityAgreement.value, amenity.id, newAgreeValue);


    console.log("After Toggle:", JSON.stringify(amenityAgreement.value, null, 2));
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

        room.value = data.room_details || {}; // Ensure room.value is always an object
        const agreements = room.value.agreements || {}; // Default agreements to an empty object

        // Check room agreement
        roomAgreement.value = agreements.room_agreement === 'yes' || !agreements.room_agreement;
        roomDeclineReason.value = agreements.room_decline_reason || "";


        // Set payment and tenancy start dates
        paymentDate.value = formatDate(agreements.payment_date);
        tenancyStartDate.value = formatDate(agreements.tenancy_start_date);

        // Check amenities agreement
        amenityAgreement.value = {};
        const amenities = Array.isArray(agreements.amenities_agreement)
            ? agreements.amenities_agreement
            : Array.isArray(room.value.rooms_amenities)
                ? room.value.rooms_amenities
                : [];

        amenities.forEach(amenity => {
            amenityAgreement.value[amenity.label || amenity.id] = amenity.agree === 'yes' || !agreements.amenities_agreement;
        });

        // Populate `chargesAgreement` dynamically
        chargesAgreement.value = {};
        const charges = Array.isArray(agreements.charges_agreement)
            ? agreements.charges_agreement
            : Array.isArray(room.value.room_charges)
                ? room.value.room_charges
                : [];

        charges.forEach(charge => {
            chargesAgreement.value[charge.charge_type || charge.id] = charge.agree === 'yes' || !agreements.charges_agreement;
        });

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
        formData.append("room_agreement", roomAgreement.value ? "yes" : "no");
        formData.append("room_decline_reason", roomDeclineReason.value);

        // Append charges along with their agreement status
        room.value.room_charges.forEach((charge, index) => {
            formData.append(`charges_agreement[${index}][charge_type]`, charge.charge_type);
            formData.append(`charges_agreement[${index}][description]`, charge.description);
            formData.append(`charges_agreement[${index}][amount]`, charge.amount);
            formData.append(`charges_agreement[${index}][agree]`, chargesAgreement.value[charge.charge_type || charge.id] ? "yes" : "no");
            formData.append(`charges_agreement[${index}][reason]`, room.value.agreements.charges_agreement[index].chargeDeclineReason);
        });

        // Append amenities agreement status
        room.value.rooms_amenities.forEach((amenity, index) => {
            formData.append(`amenities_agreement[${index}][label]`, amenity.label);
            formData.append(`amenities_agreement[${index}][description]`, amenity.description);
            formData.append(`amenities_agreement[${index}][size]`, amenity.size);
            formData.append(`amenities_agreement[${index}][color]`, amenity.color);
            formData.append(`amenities_agreement[${index}][condition]`, amenity.condition);
            formData.append(`amenities_agreement[${index}][agree]`, amenityAgreement.value[amenity.label || amenity.id] ? "yes" : "no");
            formData.append(`amenities_agreement[${index}][reason]`, room.value.agreements.amenities_agreement[index].amenityDeclineReason);
        });

        // Append image files if available
        if (idFront.value) {
            formData.append("id_front", idFront.value);
        }
        if (idBack.value) {
            formData.append("id_back", idBack.value);
        }

        // Log FormData entries
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
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
        toast.success("Agreement submitted successfully!");
        //refresh the window
        window.location.reload();
        
    } catch (error) {
        errorMessage.value = "Failed to submit agreement.";
        toast.error("Failed to submit agreement.", error);
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
