<template>
  <div>
    <!-- Header Component (Reusable) -->
    <HeaderTitle title="Properties" searchPlaceholder="Search Properties" showSearch
      :buttons="[{ text: 'Add Property', event: 'add-item', color: 'green', icon: 'plus' }]"
      @update:search="updateSearchQuery" @button-click="addProperty" />

    <!-- Property Cards -->
    <v-row>
      <v-col v-for="property in filteredProperties" :key="property.id" cols="12" md="4">
        <v-card class="property-card mx-auto" max-width="344" hover @click="handlePropertySelection(property)">
          <v-card-item>
            <v-card-title>{{ property.property_name }}</v-card-title>
            <v-card-subtitle>{{ property.property_address }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            Property Code: {{ property.property_code }}
            <!-- Show session status -->
            <div v-if="getSessionStatus(property.property_code)">
              <v-chip color="green" label>Active Session</v-chip>
            </div>
            <div v-else>
              <v-chip color="red" label>Inactive Session</v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Login Modal -->
    <LoginModal v-model="loginDialog" :property="selectedProperty" />

    <!-- Register Property Dialog -->
    <RegisterPropertyModal v-model:dialog="dialog" />
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore"; // Import Pinia store
import apiClient from "@/services/apiClient";
import HeaderTitle from "../components/HeaderTitle.vue";
import RegisterPropertyModal from "../components/RegisterPropertyModal.vue";
import LoginModal from "../components/LoginModal.vue";
import { useToast } from "vue-toastification";
import { AxiosError } from "axios";

interface Property {
  id: number;
  property_name: string;
  property_address: string;
  property_code: string;
}

export default {
  components: { HeaderTitle, RegisterPropertyModal, LoginModal },
  setup() {
    const properties = ref<Property[]>([]);
    const searchQuery = ref("");
    const dialog = ref(false);
    const loginDialog = ref(false);
    const selectedProperty = ref<Property | undefined>(undefined);
    const toast = useToast();
    const router = useRouter();
    const authStore = useAuthStore(); // Pinia authentication store

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

    onMounted(() => {
      fetchProperties();
      authStore.loadSessionsFromStorage(); // Load stored sessions
    });

    // Computed Property for Filtering Properties Based on Search
    const filteredProperties = computed(() =>
      properties.value.filter((property) =>
        property.property_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );

    // Getter to fetch session status for a specific property
    const getSessionStatus = (propertyCode: string) => {
      return authStore.getSessionForProperty(propertyCode);
    };

    // Function to Update Search Query
    const updateSearchQuery = (query: string) => {
      searchQuery.value = query;
    };

    // Open Add Property Modal
    const addProperty = () => {
      dialog.value = true;
    };

    // Handle Property Selection (Check Session Before Showing Login Modal)
    const handlePropertySelection = (property: Property) => {
      if (!property.property_code) {
        console.error("Property code is missing");
        return;
      }

      if (authStore.isAuthenticated && authStore.propertyCode === property.property_code) {
        // If already logged in for the property, proceed
        router.push({
          name: "view-property",
          params: { property_code: property.property_code }
        });
        return;
      }

      // Check session for this specific property
      if (authStore.getSessionForProperty(property.property_code)) {
        // If session exists for this property, proceed to the view page
        router.push({
          name: "view-property",
          params: { property_code: property.property_code }
        });
      } else {
        // If no session exists for this property, show login modal
        selectedProperty.value = property;
        loginDialog.value = true;
      }
    };

    return {
      properties,
      searchQuery,
      updateSearchQuery,
      filteredProperties,
      addProperty,
      dialog,
      loginDialog,
      selectedProperty,
      handlePropertySelection,
      getSessionStatus, // Expose session status function to the template
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
