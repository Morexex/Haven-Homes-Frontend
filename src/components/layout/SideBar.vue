<template>
  <v-navigation-drawer app permanent class="sidebar-drawer">
    <v-list class="static-header">
      <v-list-item class="d-flex flex-column align-center justify-center" style="background-color: #FFD700;">
        <v-img src="/assets/images/techhaven.png" class="mx-auto" max-width="120%" height="auto"
          style="margin-top: 0px; z-index: 1; position: relative;"></v-img>
        <span class="sidebar-title" style="font-family:'Courier New', Courier, monospace;">Haven Homes</span>
      </v-list-item>
    </v-list>
    <v-list class="sidebar-menu">
      <v-list-item v-for="(item, index) in menuItems" :key="index" link :to="item.route" class="sidebar-item"
        @click="selectedModule = item.route">
        <v-card flat class="menu-container" :class="{ 'active-menu': selectedModule === item.route }">
          <v-icon size="30" class="menu-icon" :class="{ 'active-icon': selectedModule === item.route }">
            {{ item.icon }}
          </v-icon>
          <span class="menu-text" :class="{ 'active-text': selectedModule === item.route }">
            {{ item.label }}
          </span>
        </v-card>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>
    <!-- Logout Item -->
    <v-list-item
    style="background-color: transparent !important; padding: 10px;"
    @click="logout"
    class="logout-item"
  >
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
import { ref } from "vue";
import { useRoute } from "vue-router";
import { onMounted } from 'vue';
import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css';

onMounted(() => {
  if (!document.querySelector('.v-navigation-drawer').hasAttribute('data-simplebar')) {
    new SimpleBar(document.querySelector('.v-navigation-drawer'));
  }
});


const route = useRoute();
const selectedModule = ref(route.path);

const menuItems = [
  { label: "DashBoard", icon: "mdi-view-dashboard", route: "/dashboard" },
  { label: "Tenants", icon: "mdi-account-group", route: "/tenants" },
  { label: "Properties", icon: "mdi-office-building", route: "/property" },
  { label: "Comms", icon: "mdi-message-text", route: "/communication" },
  { label: "Payments", icon: "mdi-cash-multiple", route: "/payments" },
  { label: "Support", icon: "mdi-lifebuoy", route: "/support" },
  { label: "Reports", icon: "mdi-file-chart", route: "/reports" },
  { label: "Permissions", icon: "mdi-shield-key", route: "/permissions" },
  { label: "Settings", icon: "mdi-cog", route: "/settings" },
];
</script>

<style scoped>
/* Smaller sidebar width */
.sidebar-drawer {
  width: 150px !important;
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
  overflow-y: auto; /* Enable vertical scrolling */
  max-height: auto;
  align-items: stretch;
  margin-top: 95px;
}

.static-header{
  position: fixed;
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
  background-color: transparent;  /* Change to your preferred blue */
  color: white !important;  /* Ensure text is visible */
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
  border: 1px solid green; /* Light border around items */
}
.v-navigation-drawer {
  padding: 0 !important; /* Ensures no extra padding */
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
  color: #FFD700 !important; /* Strong orange color for logout icon */
}

.logout-text {
  font-size: 12px;
  font-weight: bold;
  color: #FFD700;
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