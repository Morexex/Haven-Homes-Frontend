<template>
    <v-dialog v-model="props.dialog" max-width="500px" persistent>
        <v-card>
            <v-card-title class="text-h6 font-weight-bold">
                Service Review
            </v-card-title>

            <v-card-text class="d-flex flex-column">
                <div class="mb-4">Are you satisfied?</div>
                <v-btn-toggle v-model="satisfaction" class="mb-4 justify-center" mandatory>
                    <v-btn color="green" value="yes">Yes</v-btn>
                    <v-btn color="red" value="no">No</v-btn>
                </v-btn-toggle>

                <v-text-field v-if="satisfaction === 'yes' || satisfaction === 'no'" v-model="feedback"
                    :label="satisfaction === 'yes' ? 'Tell us why you\'re satisfied' : 'Tell us what went wrong'"
                    :placeholder="satisfaction === 'yes' ? 'Type your response here...' : 'Help us improve...'" outlined
                    variant="outlined" />
                <v-rating class="justify-center" v-model="rating" length="5" color="yellow"
                    background-color="grey lighten-2" half-increments />
                <div class="text-center mt-2">
                    <span class="text-sm">Rating: {{ rating }}</span>
                </div>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="emit('close')">Cancel</v-btn>
                <v-btn color="primary" :disabled="satisfaction === null" @click="submitReview">
                    Submit
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import apiClient from "@/services/apiClient";
import { ref, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";

const dialog = ref(false);
const satisfaction = ref<string | null>(null);
const feedback = ref<string>("");
const rating = ref<number>(0); // default rating is 0
const props = defineProps<{
    complaintId: string | null;
    dialog: boolean;
}>();
const authStore = useAuthStore();


const toast = useToast();
const emit = defineEmits(["submit", "close"]);

const submitReview = async () => {
    const review = {
        satisfied: satisfaction.value,
        feedback: feedback.value || null,
        rating: rating.value,
        complaint_id: props.complaintId,
    };

    try {
        await apiClient.post(`/complaints/${props.complaintId}/review`, review, {
            headers: { "Property-Code": authStore.propertyCode, "Content-Type": "multipart/form-data", },
        });
        emit("submit", review);
        toast.success("Thank you for your review!");
        dialog.value = false;
        emit("close"); // Tell parent to close dialog
        // Reset form
        satisfaction.value = null;
        feedback.value = "";
        rating.value = 0;
    } catch (error) {
        toast.error("Failed to submit review. Please try again.");
    }
};


// Show the dialog automatically when the component is mounted
onMounted(() => {
    dialog.value = true;
});
</script>