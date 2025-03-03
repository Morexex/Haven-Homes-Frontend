<template>
  <div>
    <!-- Header Component (Reusable) -->
    <HeaderTitle title="Properties" searchPlaceholder="Search Properties" showSearch
      :buttons="[{ text: 'Add Property', event: 'add-item', color: 'green', icon: 'plus' }]"
      @update:search="updateSearchQuery" @button-click="addProperty" />

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="green" size="50"></v-progress-circular>
    </div>

    <!-- Property Cards -->
    <v-row v-else>
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
import { useAuthStore } from "@/stores/authStore";
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
    const loading = ref(true); // Add loading state
    const toast = useToast();
    const router = useRouter();
    const authStore = useAuthStore();

    // Fetch Properties from API
    const fetchProperties = async () => {
      loading.value = true;
      try {
        const response = await apiClient.get<Property[]>("/properties");
        properties.value = response.data;
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          toast.error("❌ Error fetching properties:", { timeout: 3000 });
        }
      } finally {
        loading.value = false; // Stop loading
      }
    };

    onMounted(() => {
      fetchProperties();
      authStore.loadSessionsFromStorage();
    });

    const filteredProperties = computed(() =>
      properties.value.filter((property) =>
        property.property_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );

    const getSessionStatus = (propertyCode: string) => {
      return authStore.getSessionForProperty(propertyCode);
    };

    const updateSearchQuery = (query: string) => {
      searchQuery.value = query;
    };

    const addProperty = () => {
      dialog.value = true;
    };

    const handlePropertySelection = (property: Property) => {
      if (!property.property_code) {
        console.error("Property code is missing");
        return;
      }

      if (authStore.isAuthenticated && authStore.propertyCode === property.property_code) {
        router.push({
          name: "view-property",
          params: { property_code: property.property_code }
        });
        return;
      }

      if (authStore.getSessionForProperty(property.property_code)) {
        router.push({
          name: "view-property",
          params: { property_code: property.property_code }
        });
      } else {
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
      getSessionStatus,
      loading // Expose loading state
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>
