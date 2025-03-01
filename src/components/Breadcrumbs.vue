<template>
  <v-breadcrumbs :items="breadcrumbItems">
    <template v-slot:prepend>
      <v-icon>mdi-home</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';

interface BreadcrumbItem {
  title: string;
  disabled: boolean;
  href: string;
}

export default defineComponent({
  name: 'Breadcrumbs',
  setup() {
    const route = useRoute();
    const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
      return route.matched.map(route => ({
        title: route.meta.breadcrumb as string, // Ensure it's cast to string
        disabled: false,
        href: route.path
      }));
    });

    return {
      breadcrumbItems
    };
  }
});
</script>

<style scoped>
/* Add your styles here */
</style>
