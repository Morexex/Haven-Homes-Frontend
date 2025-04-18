<template>
  <v-navigation-drawer app permanent class="sidebar-drawer">
    <v-list class="static-header">
      <v-list-item class="d-flex flex-column align-center justify-center" style="background-color: orange;">
        <v-img src="/assets/images/techhaven.png" class="mx-auto" max-width="120%" height="auto"
          style="margin-top: 0px; z-index: 1; position: relative;"></v-img>
        <span class="sidebar-title" style="font-family:'Courier New', Courier, monospace;">Haven Homes</span>
      </v-list-item>
    </v-list>
    <v-list class="sidebar-menu">
      <v-list-item v-for="(item, index) in menuItems" :key="index" class="sidebar-item" @click="handleNavigation(item)">
        <v-card flat class="menu-container" :class="{ 'active-menu': route.path.startsWith(item.route) }">
          <v-icon size="30" class="menu-icon" :class="{ 'active-icon': route.path.startsWith(item.route) }">
            {{ item.icon }}
          </v-icon>
          <span class="menu-text" :class="{ 'active-text': route.path.startsWith(item.route) }">
            {{ item.label }}
          </span>
        </v-card>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>
    <!-- Logout Item -->
    <v-list-item style="background-color: transparent !important; padding: 10px;" @click="logout" class="logout-item">
      <div class="logout-column">
        <v-icon size="30" color="orange" class="menu-icon">
          mdi-logout
        </v-icon>
        <span class="logout-text">Logout</span>
      </div>
    </v-list-item>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiClient";

const route = useRoute();
const router = useRouter();
const selectedModule = ref(route.path); // Initially set to the current route
const authStore = useAuthStore();
const userRole = computed(() => authStore.user?.role);

onMounted(() => {
  if (!document.querySelector(".v-navigation-drawer").hasAttribute("data-simplebar")) {
    new SimpleBar(document.querySelector(".v-navigation-drawer"));
  }
});

// Watch for route changes and update selectedModule
watch(() => route.path, (newPath) => {
  selectedModule.value = newPath;
});

const menuItems = [
  { label: "DashBoard", icon: "mdi-view-dashboard", route: "/dashboard" },
  { label: "property", icon: "mdi-office-building", route: "/property" },
  { label: "Comms", icon: "mdi-message-text", route: "/communication" },
  { label: "Payments", icon: "mdi-cash-multiple", route: "/payments" },
  { label: "Support", icon: "mdi-lifebuoy", route: "/support" },
  { label: "Reports", icon: "mdi-file-chart", route: "/reports" },
  { label: "Permissions", icon: "mdi-shield-key", route: "/permissions" },
  { label: "Settings", icon: "mdi-cog", route: "/settings" },
];

const handleNavigation = (item) => {
  if (item.label === "property" && userRole.value === "user") {
    if (authStore.propertyCode) {
      router.push({ name: "view-property", params: { property_code: authStore.propertyCode } });
    } else {
      console.error("No property code found in store.");
    }
  } else {
    router.push(item.route);
  }
};

const logout = async () => {
  try {
    await apiClient.post("/logout", {}, { headers: { Authorization: `Bearer ${authStore.token}` } });
    authStore.clearAuthData();
    window.location.replace("/login");
    window.location.reload();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};



</script>

<style scoped>
.sidebar-drawer {
  width: 150px !important;
  position: fixed !important;
  padding-top: 20px;
  border-right: 1px solid #ddd;
}

.sidebar-title {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin-top: 5px;
  display: block;
  color: white;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  /* Enable vertical scrolling */
  max-height: auto;
  align-items: stretch;
  margin-top: 95px;
}

.static-header {
  position: fixed !important;
  justify-content: center;
  width: 100%;
  background-color: transparent;
  z-index: 1;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  border-bottom: 1px solid #ddd;
}

.sidebar-item {
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: transparent;
  transition: background-color 0.3s ease-in-out;
}

.sidebar-item:hover,
.sidebar-item.v-list-item--active {
  background-color: transparent;
  /* Change to your preferred blue */
  color: white !important;
  /* Ensure text is visible */
}

/* Menu container with fixed size */
.menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  padding: 10px;
  border-radius: 15px;
  transition: all 0.3s ease-in-out;
  background-color: transparent;
  cursor: pointer;
  border: 1px solid green;
  /* Light border around items */
}

.v-navigation-drawer {
  padding: 0 !important;
  /* Ensures no extra padding */
  width: 150px !important;
}

/* Logout icon styles */
/* Logout icon and text in a column */
.logout-item {
  background-color: transparent !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.logout-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logout-item .menu-icon {
  color: orange !important;
  /* Strong orange color for logout icon */
}

.logout-text {
  font-size: 12px;
  font-weight: bold;
  color: orange;
  margin-top: 5px;
}

/* Default icon and text color */
.menu-icon,
.menu-text {
  color: green;
}


/* Active/Selected menu */
.active-menu {
  background-color: green !important;
}

.active-menu .menu-icon,
.active-menu .menu-text {
  color: white !important;
}
</style>