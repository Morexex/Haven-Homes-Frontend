<template>
  <div>
    <!-- Header Component (Reusable) -->
    <HeaderTitle
      title="Properties"
      searchPlaceholder="Search Properties"
      showSearch
      :buttons="[
        { text: 'Add Property', event: 'add-item', color: 'green', icon: 'plus' },
      ]"
      @update:search="updateSearchQuery"
      @button-click="addProperty"
    />

    <!-- Property Cards -->
    <v-row>
      <v-col v-for="property in filteredProperties" :key="property.id" cols="12" md="4">
        <v-card
          class="property-card mx-auto"
          max-width="344"
          hover
          @click="openLoginModal(property)"
        >
          <v-card-item>
            <v-card-title>{{ property.property_name }}</v-card-title>
            <v-card-subtitle>{{ property.property_address }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            Property Code:
            {{ property.property_code }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Login Modal Component -->
    <LoginModal v-model="loginDialog" :property="selectedProperty" />

    <!-- Register Property Dialog Component -->
    <RegisterPropertyModal v-model:dialog="dialog" />
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from "vue";
import apiClient from "@/services/apiClient"; // Ensure correct path
import HeaderTitle from "../components/HeaderTitle.vue";
import RegisterPropertyModal from "../components/RegisterPropertyModal.vue";
import LoginModal from "../components/LoginModal.vue";
import { useToast } from "vue-toastification";
import { AxiosError } from "axios";

// Define the property type
interface Property {
  id: number;
  property_name: string;
  property_address: string;
  property_code?: string;
}

export default {
  components: { HeaderTitle, RegisterPropertyModal, LoginModal },
  setup() {
    const properties = ref<Property[]>([]);
    const searchQuery = ref("");
    const dialog = ref(false);
    const loginDialog = ref(false);
    const selectedProperty = ref<Property>({
      id: 0,
      property_name: "",
      property_address: "",
      property_code: "",
    });
    const toast = useToast();

    // Fetch Properties from API
    const fetchProperties = async () => {
      try {
        const response = await apiClient.get<Property[]>("/properties");
        properties.value = response.data;
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          toast.error("❌ Error fetching properties:", { timeout: 3000 });
        }
      }
    };

    onMounted(fetchProperties);

    // Computed Property for Filtering Properties Based on Search
    const filteredProperties = computed(() =>
      properties.value.filter((property) =>
        property.property_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );

    // Function to Update Search Query (Fix for TypeScript error)
    const updateSearchQuery = (query: string) => {
      searchQuery.value = query;
    };

    // Open Add Property Modal
    const addProperty = () => {
      dialog.value = true;
    };

    // Open Login Modal for a Selected Property
    const openLoginModal = (property: Property) => {
      selectedProperty.value = property;
      loginDialog.value = true;
    };

    return {
      properties,
      searchQuery,
      updateSearchQuery, // ✅ Fixed function for updating search
      filteredProperties,
      addProperty,
      dialog,
      loginDialog,
      selectedProperty,
      openLoginModal,
    };
  },
};
</script>

<style scoped>
.property-card {
  border: 2px solid green;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.property-card:hover {
  background-color: rgba(0, 128, 0, 0.1);
  box-shadow: 0px 4px 10px rgba(0, 128, 0, 0.3);
}
</style>
