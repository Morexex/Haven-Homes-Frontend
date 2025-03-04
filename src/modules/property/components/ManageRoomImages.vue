<template>
    <v-container>
        <!-- Top Bar with Cancel Icon -->
        <v-row justify="space-between" align="center" class="mb-4">
            <v-col cols="10">
                <h2>Manage Room Images</h2>
            </v-col>
            <v-col cols="2" class="text-right">
                <v-btn icon size="small" @click="goBack">
                    <v-icon size="20">mdi-close</v-icon>
                </v-btn>
            </v-col>
        </v-row>

        <!-- Image Upload/Update Form -->
        <v-card class="pa-4">
            <v-form id="image-form" @submit.prevent="selectedImage ? updateImage() : uploadImages()">
                <v-file-input label="Select Image" accept="image/*" multiple variant="outlined"
                    @update:modelValue="previewImages" append-inner-icon="mdi-camera">
                </v-file-input>

                <!-- Image Type Dropdown -->
                <v-select label="Select Amenity" :items="filteredAmenities.map(a => a.label)" v-model="selectedTag"
                    variant="outlined" :placeholder="amenityPlaceholder">
                </v-select>

                <!-- Image Preview -->
                <v-row v-if="imagePreviews.length" class="mt-4">
                    <v-col v-for="(image, index) in imagePreviews" :key="index" cols="4">
                        <v-card class="pa-2">
                            <v-img :src="image" aspect-ratio="1" class="rounded-lg" cover></v-img>
                        </v-card>
                    </v-col>
                </v-row>

                <v-btn :color="selectedImage ? 'warning' : 'orange'" class="mt-4 mr-2" :loading="uploading"
                    @click="selectedImage ? updateImage() : uploadImages()">
                    {{ selectedImage ? "Update Image" : "Upload" }}
                </v-btn>
                <!-- add another button to add amenity -->
                <v-btn color="green" class="mt-4" @click="handleButtonClick('add-amenity')">
                    Add Amenity
                </v-btn>

                <v-btn v-if="selectedImage" class="mt-4 ml-2" color="red" @click="clearSelection">Cancel</v-btn>
            </v-form>
        </v-card>

        <!-- Display Uploaded Property Images -->
        <h3 class="mt-6">Uploaded Images</h3>
        <v-row v-if="roomImages.length">
            <v-col v-for="(image, index) in roomImages" :key="index" cols="4">
                <v-card class="pa-2 image-card" @mouseenter="hoveredImageId = image.id"
                    @mouseleave="hoveredImageId = null">
                    <v-img :src="image.image_url" aspect-ratio="1" class="rounded-lg" cover></v-img>
                    <v-card-subtitle>{{ image.tag }}</v-card-subtitle>

                    <!-- Hover Edit Button -->
                    <v-btn class="edit-button" color="blue" v-show="hoveredImageId === image.id"
                        @click.stop="selectImage(image)">
                        Edit
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
        <p v-else>No images uploaded yet.</p>
    </v-container>
    <AddAmenityModal v-model="amenityDialog" @amenity-added="refreshAmenities" />
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/services/apiClient";
import { useToast } from "vue-toastification";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";
import AddAmenityModal from "./AddAmenityModal.vue";

// Receive propertyId from the route
const props = defineProps<{ id: string }>();
const roomCategory = ref<string | null>(null);
const amenities = ref<any[]>([]);
const filteredAmenities = ref<any[]>([]);
const isLoading = ref<boolean>(true);
const selectedTag = ref<string | null>(null);

//State variables
const selectedImages = ref<File[]>([]);
//const selectedTag = ref<string>("");
const imagePreviews = ref<string[]>([]);
const roomImages = ref<any[]>([]);
const uploading = ref<boolean>(false);
const selectedImage = ref<any | null>(null);
const hoveredImageId = ref<number | null>(null);
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const amenityDialog = ref(false);

//Go back function
const goBack = () => {
    router.back();
};


const handleButtonClick = (event: string) => {
    if (event === "add-amenity") amenityDialog.value = true;
};

//Fetch property images
const fetchRoomImages = async () => {
    if (!props.id) {
        toast.error("Room ID is missing.");
        return;
    }

    try {
        const response = await apiClient.get(`/rooms/${props.id}/images`, {
            headers: { "Property-Code": authStore.propertyCode },
        });
        roomImages.value = response.data.images;
        fetchAmenities();
    } catch (error) {
        console.error("Failed to fetch images:", error);
        toast.error("Failed to load room images.");
    }
};

// Fetch Room Details (including category)
const fetchRoomDetails = async () => {
    if (!props.id) {
        toast.error("Room ID is missing.");
        return;
    }

    try {
        const response = await apiClient.get(`/rooms/${props.id}`, {
            headers: { "Property-Code": authStore.propertyCode },
        });

        roomCategory.value = response.data.category?.label || null;
        fetchAmenities(); // Fetch amenities after getting room category
    } catch (error) {
        toast.error("Failed to fetch room details.");
        console.error(error);
    }
};

// Fetch Amenities and Filter
const fetchAmenities = async () => {
    if (!authStore.propertyCode) return;

    isLoading.value = true;

    try {
        const response = await apiClient.get("/amenities", {
            headers: { "Property-Code": authStore.propertyCode },
        });

        amenities.value = response.data;

        // Filter amenities based on the room category
        filteredAmenities.value = amenities.value.filter(
            (amenity) => amenity.category.label === roomCategory.value
        );
    } catch (error) {
        toast.error("Failed to load amenities.");
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

// Computed property to determine the correct placeholder
const amenityPlaceholder = computed(() => {
    if (isLoading.value) return "Loading amenities...";
    return filteredAmenities.value.length === 0
        ? "Add Room's category amenity first"
        : "Select an amenity";
});


const refreshAmenities = fetchRoomDetails;

//Preview selected images before upload
const previewImages = (event: File | File[] | undefined) => {
    if (!event) return;

    // Ensure event is always an array
    selectedImages.value = Array.isArray(event) ? event : [event];

    imagePreviews.value = [];
    selectedImages.value.forEach((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            if (e.target?.result) {
                imagePreviews.value.push(e.target.result as string);
            }
        };
    });
};


//Upload images
const uploadImages = async () => {
    if (!selectedImages.value.length || !selectedTag.value) {
        toast.error("Please select images and a tag.");
        return;
    }

    uploading.value = true;
    const formData = new FormData();
    selectedImages.value.forEach((image) => {
        formData.append("images[]", image);
    });
    if (selectedTag.value) {
        formData.append("tag", selectedTag.value);
    }

    try {
        await apiClient.post(`/rooms/${props.id}/upload-images`, formData, {
            headers: { "Content-Type": "multipart/form-data", "Property-Code": authStore.propertyCode },
        });

        toast.success("Images uploaded successfully!");
        fetchRoomImages();
        clearSelection();
    } catch (error) {
        handleApiError(error);
    } finally {
        uploading.value = false;
    }
};

//Update selected image
const updateImage = async () => {
    if (!selectedImage.value) return;

    uploading.value = true;
    const formData = new FormData();
    if (selectedTag.value) {
        formData.append("tag", selectedTag.value);
    }

    if (selectedImages.value.length > 0) {
        formData.append("image", selectedImages.value[0]);
    }

    try {
        await apiClient.post(`/rooms/${props.id}/images/${selectedImage.value.id}/update`, formData, {
            headers: { "Content-Type": "multipart/form-data", "Property-Code": authStore.propertyCode },
        });

        toast.success("Image updated successfully!");
        fetchRoomImages();
        clearSelection();

        //Scroll to the top of the page after update
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        handleApiError(error);
    } finally {
        uploading.value = false;
    }
};

//Select an image for editing
const selectImage = (image: any) => {
    selectedImage.value = image;
    selectedTag.value = image.tag;

    // Scroll to the form smoothly
    const formElement = document.getElementById("image-form");
    if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
};

//Clear selection
const clearSelection = () => {
    selectedImage.value = null;
    selectedImages.value = [];
    selectedTag.value = "";
};

//Handle API errors
const handleApiError = (error: unknown) => {
    if (error instanceof AxiosError && error.response) {
        const errorMessage = error.response.data.error || "Something went wrong!";
        toast.error(`❌ Error: ${errorMessage}`);
    } else {
        toast.error("❌ An unexpected error occurred!");
    }
};

//Fetch images and room details on component mount
onMounted(() => {
    fetchRoomDetails();
    fetchRoomImages();
});
</script>

<style scoped>
.image-card {
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
}

.image-card:hover {
    transform: scale(1.05);
}

.edit-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    opacity: 0;
    transition: opacity 0.3s;
}

.image-card:hover .edit-button {
    opacity: 1;
}
</style>
