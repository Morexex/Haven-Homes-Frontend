<template>
  <v-app-bar app height="70" class="top-bar" elevate-on-scroll :style="{ marginLeft: '-100px' }">
    <v-container class="d-flex align-center justify-between">
      <!-- Left Content: Heart Icon and Explore Button -->
      <v-row class="d-flex align-center" style="width: 100%;">
        <v-col cols="auto" class="d-flex justify-center">
          <v-btn @click="exploreClicked" variant="outlined" color="green" size="small">
            Explore Homes
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-icon size="30" color="#FFD700">mdi-heart</v-icon>
        </v-col>

        <v-spacer></v-spacer>
        <span class="sidebar-title" style="font-family: 'Courier New', Courier, monospace;">Haven Homes</span>

        <!-- Theme Switcher -->
        <v-btn icon @click="themeStore.toggleTheme">
          <v-icon :icon="themeStore.darkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night'"></v-icon>
        </v-btn>
      </v-row>

      <!-- Right Content: Notification, Profile, and Settings -->
      <v-row class="d-flex align-center justify-end" style="width: 100%;">
        <!-- Notification Icon with Badge -->
        <v-menu v-model="menu" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-badge :content="notificationCount" color="green" size="small">
                <v-icon icon="mdi-bell" color="#FFD700"></v-icon>
              </v-badge>
            </v-btn>
          </template>
          <v-card min-width="300">
            <v-list>
              <v-list-item
                v-for="(notification, index) in notifications"
                :key="index"
                :prepend-avatar="notification.avatar"
                :title="notification.title"
                :subtitle="notification.subtitle">
                <template v-slot:append>
                  <v-btn :class="fav ? 'text-red' : ''" icon="mdi-heart" variant="text" @click="fav = !fav"></v-btn>
                </template>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="text" @click="menu = false">Cancel</v-btn>
              <v-btn color="primary" variant="text" @click="menu = false">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <!-- Profile Avatar and Dropdown Menu -->
        <v-menu v-model="profileMenu" :close-on-content-click="false" :nudge-width="200">
          <template #activator="{ on }">
            <v-btn icon v-bind="on">
              <v-avatar size="30">
                <v-img src="https://randomuser.me/api/portraits/men/81.jpg"></v-img>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="navigateToProfile">
              <v-list-item-content>
                <v-list-item-title>Profile</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-content>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { ref } from "vue";
import { useThemeStore } from "@/stores/themes.ts";

// State variables for menu and theme
const themeStore = useThemeStore();
const fav = ref(true);
const menu = ref(false);
const profileMenu = ref(false);

// Notifications and count
const notificationCount = ref(6);
const notifications = ref([
  { avatar: 'https://cdn.vuetifyjs.com/images/john.jpg', title: 'John Leider', subtitle: 'Founder of Vuetify' },
  // Add more notifications as needed
]);

// Action Methods
const exploreClicked = () => {
  console.log("Explore button clicked");
  // Add navigation logic if needed
};

const navigateToProfile = () => {
  console.log("Navigating to profile");
  // Add router navigation logic here
};

const logout = () => {
  console.log("Logging out");
  // Handle logout functionality here
};
</script>

<style scoped>
.top-bar {
  background-color: #f4f4f4;
  border-radius: 15px;
  position: fixed;
  margin-top: 12px;
  margin-left: auto;
  width: calc(100vw - 190px) !important; /* Adjust to the entire viewport width minus the sidebar */
  top: 0;
  z-index: 1000;
}

.sidebar-title {
  font-family: 'Courier New', Courier, monospace;
}

.v-avatar img {
  border-radius: 50%;
}

.v-menu .v-list-item {
  padding: 10px 20px;
}

.v-switch {
  margin-right: 10px;
}
</style>
