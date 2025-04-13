<template>
    <v-container class="complaint-thread-container">
        <v-card class="audit-agreement-card pa-6 rounded-lg elevation-3">
            <!-- Close icon -->
            <v-row class="mb-4">
                <v-col cols="12" class="d-flex justify-end">
                    <v-btn icon @click="$router.back()">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-card-text v-if="isNewComplaint">
                <!-- Title Section -->
                <v-row>
                    <v-col cols="12">
                        <v-typography variant="h5" class="mb-4">
                            <span class="font-weight-bold">Create New Complaint</span><br />
                            <span class="subtitle-1">Fill in the details below to report a new complaint.</span>
                        </v-typography>
                    </v-col>
                </v-row>

                <!-- Form Section -->
                <v-row dense>
                    <!-- Complaint Title -->
                    <v-col cols="12" md="6">
                        <v-text-field v-model="complaintForm.title" label="Complaint Title" required variant="outlined"
                            class="my-2" :rules="[v => !!v || 'Title is required']" dense prepend-icon="mdi-pencil"
                            hint="Enter a brief title for the complaint" persistent-hint />
                    </v-col>

                    <!-- Category -->
                    <v-col cols="12" md="6">
                        <v-select v-model="complaintForm.category"
                            :items="['Maintenance', 'Noise', 'Security', 'Other']" label="Category" required
                            variant="outlined" class="my-2" :rules="[v => !!v || 'Category is required']" dense
                            prepend-icon="mdi-folder-outline" hint="Select the category of the complaint"
                            persistent-hint />
                    </v-col>

                    <!-- Priority -->
                    <v-col cols="12" md="6">
                        <v-select v-model="complaintForm.priority" :items="['Normal', 'Low', 'Medium', 'High', 'Urgent']"
                            label="Priority" required variant="outlined" class="my-2"
                            :rules="[v => !!v || 'Priority is required']" dense prepend-icon="mdi-alert-circle-outline"
                            hint="Set the priority of the complaint" persistent-hint />
                    </v-col>

                    <!-- Description -->
                    <v-col cols="12">
                        <v-textarea v-model="complaintForm.description" label="Description" rows="3" auto-grow required
                            variant="outlined" class="my-2" :rules="[v => !!v || 'Description is required']"
                            prepend-icon="mdi-comment-text-outline" hint="Provide more details about the issue"
                            persistent-hint />
                    </v-col>

                    <!-- Incident Date -->
                    <v-col cols="12" md="6">
                        <v-date-picker v-model="complaintForm.incident_date" label="Incident Date" variant="outlined"
                            class="my-2" :rules="[(v: String) => !!v || 'Date is required']" dense
                            prepend-icon="mdi-calendar-outline" hint="Pick the date when the incident occurred"
                            persistent-hint />
                    </v-col>

                </v-row>
            </v-card-text>

            <!-- Complaint Details -->
            <v-card v-if="!isNewComplaint" class="section-card my-4 pa-4 rounded-lg elevation-2">
                <v-card-title>Complaint Thread</v-card-title>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" md="6" v-for="(label, key) in complaintFields" :key="key">
                            <div class="complaint-label">
                                <span class="font-weight-bold text-green text-h6">
                                    {{ label.title }}:
                                </span>
                                <span class="text-body-1">
                                    {{ label.value }}
                                </span>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- Chat Section -->
            <v-card class="section-card my-4 pa-4 rounded-lg elevation-2">
                <v-card-title class="text-h6 font-weight-bold mb-4">Chat with Support</v-card-title>

                <!-- Chat Messages -->
                <v-sheet ref="chatContainer" class="chat-messages pa-3 mb-4" elevation="1" height="300px"
                    style="overflow-y: auto;">
                    <div v-for="(msg, index) in messages" :key="index" class="mb-3">
                        <div :class="['chat-bubble', msg.sender === user.name ? 'sent' : 'received']">
                            <div class="sender font-weight-medium mb-1">{{ msg.sender }}</div>
                            <div class="message" v-if="msg.message">{{ msg.message }}</div>

                            <div class="image-wrapper" v-if="msg.attachment_url">
                                <img :src="msg.attachment_url" class="chat-image mt-2" />
                                <v-icon class="download-icon" @click="downloadImage(msg.attachment_url)">
                                    mdi-download
                                </v-icon>
                            </div>

                            <div class="timestamp text-caption mt-1">{{ formatTimestamp(msg.created_at) }}</div>
                        </div>
                    </div>
                </v-sheet>

                <!-- Chat Input -->
                <v-row align="center" class="chat-input px-4 py-2"
                    style="background-color: #f9f9f9; border-radius: 12px;">
                    <v-col cols="12" md="8">
                        <v-text-field v-model="newMessage" placeholder="Type your message..." dense hide-details
                            variant="outlined" class="message-input" rounded append-inner-icon="mdi-emoticon-outline" />
                    </v-col>

                    <!-- Image Upload Button -->
                    <v-col cols="6" md="1" class="d-flex justify-center">
                        <v-tooltip text="Attach Image">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon color="blue-grey" @click="triggerFileUpload">
                                    <v-icon>mdi-image</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                        <input type="file" accept="image/*" ref="fileInput" @change="handleImageUpload"
                            style="display: none;" />
                    </v-col>

                    <!-- Send Button -->
                    <v-col cols="6" md="1" class="d-flex justify-center">
                        <v-tooltip text="Send Message">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon color="green" @click="sendOrUpdateMessage">
                                    <v-icon>mdi-send</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                    </v-col>

                    <!-- Image Preview -->
                    <v-col cols="12" v-if="selectedImagePreview" class="d-flex align-center mt-3">
                        <v-card elevation="2" class="pa-2" style="max-width: 200px; position: relative;">
                            <v-img :src="selectedImagePreview" max-height="150" class="rounded-lg" />

                            <v-btn icon color="red" @click="clearSelectedFile" size="small" class="position-absolute"
                                style="top: -10px; right: -10px;">
                                <v-icon small>mdi-close</v-icon>
                            </v-btn>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card>
        </v-card>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";
import { useToast } from "vue-toastification";
import { useRoute } from "vue-router";

const authStore = useAuthStore();
const toast = useToast();
const user = computed(() => authStore.user);

const complaint = ref<any>({});
const messages = ref<any[]>([]);
const newMessage = ref<string>("");
const fileInput = ref<HTMLInputElement | null>(null);
const isNewComplaint = ref<boolean>(true);
const complaintForm = ref({
    title: "",
    description: "",
    category: null,
    priority: null,
    //default date should be today
    incident_date: new Date(),
    evidence_url: null,
});
const route = useRoute();
const chatContainer = ref<any>(null);
const selectedImageFile = ref<File | null>(null);
const selectedImagePreview = ref<string | null>(null);


function clearSelectedFile() {
    selectedImageFile.value = null;
    selectedImagePreview.value = "";
}

const downloadImage = async (attachmentUrl: string | undefined) => {
    if (!attachmentUrl) {
        toast.error("No image to download");
        return;
    }

    const filename = attachmentUrl.split("/").pop();
    const downloadUrl = `/download-image/${filename}`;

    try {
        const response = await apiClient.get(downloadUrl, {
            headers: {
                "Property-Code": authStore.propertyCode,
            },
            responseType: "blob",
        });

        const blobUrl = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename || "download.png";
        link.click();
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        toast.error("Failed to download image.");
    }
};



const handleImageUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        selectedImageFile.value = file;

        // For preview if needed
        const reader = new FileReader();
        reader.onload = () => {
            selectedImagePreview.value = reader.result as string;
        };
        reader.readAsDataURL(file);
    }
};


const triggerFileUpload = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};


const scrollToBottom = () => {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

watch(
    () => route.params.complaintId !== "new",
    (newId) => {
        if (newId) {
            isNewComplaint.value = false;
        } else {
            isNewComplaint.value = true;
        }
    },
    { immediate: true }
);

const props = defineProps<{
    complaintId: string;
}>();


const sendOrUpdateMessage = async () => {
    if (!newMessage.value.trim() && !selectedImageFile.value) return;

    const formData = new FormData();
    formData.append("message", newMessage.value);
    formData.append("sender", authStore.user.name);

    if (selectedImageFile.value) {
        formData.append("attachment_url", selectedImageFile.value);
    }

    try {
        let response;
        if (props.complaintId !== "new") {
            // Send message to existing complaint
            response = await apiClient.post(`/complaints/${props.complaintId}/messages`, formData, {
                headers: { "Property-Code": authStore.propertyCode, "Content-Type": "multipart/form-data", },
            });
        } else {
            // Create a new complaint
            const newComplaintPayload = {
                title: complaintForm.value.title,
                description: complaintForm.value.description,
                category: complaintForm.value.category,
                priority: complaintForm.value.priority,
                status: "Pending",
                complainant_id: authStore.user.id,
                incident_date: formatDateForBackend(complaintForm.value.incident_date),
            };

            // Append the complaint form details to formData
            Object.entries(newComplaintPayload).forEach(([key, value]) => {
                formData.append(key, value as any);
            });

            // Send the form data for the new complaint
            response = await apiClient.post("/complaints", formData, {
                headers: { "Property-Code": authStore.propertyCode, "Content-Type": "multipart/form-data", },
            });
        }

        // Handle success
        const data = props.complaintId !== "new" ? response.data.data : response.data.data.message;
        messages.value.push(data);
        newMessage.value = "";
        selectedImagePreview.value = ""; // Reset image preview after sending
        selectedImageFile.value = null; // Reset selected file

        //if its new complaint, fetch the thread again
        if (isNewComplaint.value) {
            //go back to the previous page
            setTimeout(() => {
                window.history.back();
            }, 1000);
        }

        nextTick(() => setTimeout(scrollToBottom, 100));
    } catch (error) {
        toast.error(`Failed to send message. ${error}`);
    }
};

const fetchComplaintThread = async () => {
    try {
        const { data } = await apiClient.get(`/complaints/${props.complaintId}`, {
            headers: { "Property-Code": authStore.propertyCode },
        });
        complaint.value = data.data;
        messages.value = data.data.messages || [];
    } catch (error) {
        toast.error("Failed to load complaint thread.");
    }
};

const formatTimestamp = (timestamp: string | Date) => {
    return timestamp instanceof Date
        ? timestamp.toLocaleString()
        : new Date(timestamp).toLocaleString();
};

function formatDate(isoDate: string): string {
    if (!isoDate) return ''; // Return empty if no date is provided
    return isoDate.split('T')[0]; // Format to YYYY-MM-DD
}

function formatDateForBackend(date: any): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0]; // returns "YYYY-MM-DD"
}



const complaintFields = computed(() => ({
    Title: { title: "Title", value: complaint.value.title },
    Description: { title: "Description", value: complaint.value.description },
    Category: { title: "Category", value: complaint.value.category },
    Priority: { title: "Priority", value: complaint.value.priority },
    IncidentDate: { title: "Incident Date", value: formatDate(complaint.value.incident_date) },
}));

onMounted(() => {
    if (props.complaintId !== "new") {
        fetchComplaintThread();
    }
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

.chat-bubble {
    padding: 10px;
    border-radius: 12px;
    max-width: 70%;
    word-break: break-word;
}

.chat-bubble.sent {
    background-color: #e0f7e9;
    margin-left: auto;
}

.chat-bubble.received {
    background-color: #f0f0f0;
    margin-right: auto;
}

.chat-image {
    max-height: 150px;
    border-radius: 8px;
    margin-top: 5px;
    max-width: 250px;
}

.image-wrapper {
    position: relative;
    display: inline-block;
}

.chat-image {
    max-width: 200px;
    border-radius: 8px;
}

.download-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border-radius: 50%;
    padding: 6px;
    font-size: 40px;
    opacity: 0;
    cursor: pointer;
    transition: opacity 0.2s;
}

.image-wrapper:hover .download-icon {
    opacity: 1;
}
</style>