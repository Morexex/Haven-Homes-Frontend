<template>
    <!-- Title -->
    <v-card-title class="text-center justify-center py-6">
        <h1 class="font-weight-bold text-h3 text-nav">More Property Details</h1>
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
import { defineComponent, ref } from "vue";
import ListRoomCategories from "@/modules/property/components/ListRoomCategories.vue";
import ListRoomAmenities from "@/modules/property/components/ListRoomAmenities.vue";
import ListRoomAgreements from "@/modules/property/components/ListRoomAgreements.vue";
import ListRoomCharges from "@/modules/property/components/ListRoomCharges.vue";

export default defineComponent({
  setup() {
    const tab = ref("property");
    const items = [
      { label: "Categories", value: "categories", component: ListRoomCategories },
      { label: "Amenities", value: "amenities", component: ListRoomAmenities },
      { label: "Agreements", value: "agreements", component: ListRoomAgreements },
      { label: "Charges", value: "charges", component: ListRoomCharges },
    ];

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
