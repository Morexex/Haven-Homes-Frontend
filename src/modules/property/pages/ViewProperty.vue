<template>
    <!-- Title -->
    <v-card-title class="text-center justify-center py-6">
        <h1 class="font-weight-bold text-h3 text-nav">Property</h1>
      </v-card-title>

      <!-- Fixed Tabs -->
      <div class="sticky-tabs">
        <v-tabs v-model="tab" elevation="2" grow>
          <v-tab v-for="(item, index) in items" :key="index" :value="item.value">
            {{ item.label }}
          </v-tab>
        </v-tabs>
      </div>

      <!-- Scrollable Content with Global SimpleBar -->
      <div v-simplebar class="scrollable-content">
        <v-tabs-window v-model="tab">
          <v-tabs-window-item v-for="(item, index) in items" :key="index" :value="item.value">
            <component :is="item.component" />
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import PropertyDetails from "@/modules/property/components/PropertyDetails.vue";
import Vacancies from "@/modules/property/components/Vacancies.vue";
import Rooms from "@/modules/property/components/Rooms.vue";
import Tenants from "@/modules/property/components/Tenants.vue";
import Staff from "@/modules/property/components/Staffs.vue";
import { useAuthStore } from "@/stores/authStore";

export default defineComponent({
  setup() {
    const tab = ref("property");
    const authStore = useAuthStore(); // Get authentication store
    const userRole = computed(() => authStore.user?.role); // Access the stored user role
    const allItems = [
      { label: "Property", value: "property", component: PropertyDetails },
      { label: "Vacancies", value: "vacancies", component: Vacancies },
      { label: "Rooms", value: "rooms", component: Rooms },
      { label: "Tenants", value: "tenants", component: Tenants },
      { label: "Staff", value: "staff", component: Staff },
    ];

    // Filter out "Property" tab if the user is a "user"
    const items = computed(() => {
      return userRole.value === "user"
        ? allItems.filter(item => item.value !== "property")
        : allItems;
    });

    return {
      tab,
      items,
    };
  },
});
</script>

<style scoped>
/* Keep tabs fixed at the top */
.sticky-tabs {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Allow content to scroll while keeping tabs fixed */
.scrollable-content {
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
}

.text-nav {
  color: #356859 !important;
}
</style>
