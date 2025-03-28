<template>
    <v-container class="complaint-thread-container">
        <v-card class="audit-agreement-card pa-6 rounded-lg elevation-3">
            <!-- Room Details -->
            <v-card class="section-card my-4 pa-4 rounded-lg elevation-2">
                <v-card-title>Complaint Thread</v-card-title>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    Complaint:
                                </span>
                                <span class="text-body-1">
                                    Irresponsible tenants in room B12 behavior
                                </span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    Date Raised:
                                </span>
                                <span class="text-body-1">
                                    25th May 2025
                                </span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    Status:
                                </span>
                                <span class="text-body-1">
                                    Pending
                                </span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    Priority:
                                </span>
                                <span class="text-body-1">
                                    Urgent
                                </span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    Category:
                                </span>
                                <span class="text-body-1">
                                    Apartment Complaint
                                </span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    Raised By:
                                </span>
                                <span class="text-body-1">
                                    John Doe
                                </span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    Assigned To:
                                </span>
                                <span class="text-body-1">
                                    Jane Smith
                                </span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    Average Response Time:
                                </span>
                                <span class="text-body-1">
                                    2 days
                                </span>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-card>
    </v-container>

</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const props = defineProps(["complaintId"]);
const toast = useToast();
const loading = ref(false);

// Function to format ISO date to YYYY-MM-DD
const formatDate = (isoDate) => {
    if (!isoDate) return ''; // Return empty if no date is provided
    return isoDate.split('T')[0]; // Extracts only the YYYY-MM-DD part
};


// Close Agreement
const closeThread = () => {
    router.back();
};

// Fetch Room Details
const fetchComplaintThread = async () => {
    try {
        console.log(props.complaintId);
        if (props.complaintId !== 'new') {
            const { data } = await apiClient.get(`/complaints/${props.complaintId}`, {
            headers: { "Property-Code": authStore.propertyCode },
        });

        complaint.value = data || {};
        } else {
            toast.warning("Start a new complaint thread");
        }

    } catch (error) {
        toast.error(`Failed to fetch complaint details: ${error.message}`);
    }
};
// Load Data
onMounted(() => {
    fetchComplaintThread();
});
</script>

<style scoped>
.complaint-thread-container {
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

.complaint-thread-container {
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
