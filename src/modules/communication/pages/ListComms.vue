<template>
    <div class="container">
        <v-container>
            <v-row justify="center" align="center" class="pa-4">
            <v-col cols="12" sm="10" md="8">
                <v-card class="pa-4" outlined>
                <v-row justify="center" align="center" dense>
                    <v-col v-for="page in pages" :key="page.route" cols="12" sm="6" md="4">
                    <v-card class="section-card" max-width="200" min-height="170" hover
                        @click="handleSectionSelection(page.route)">
                        <v-card-item class="text-center">
                        <v-icon size="60" color="green">{{ page.icon }}</v-icon>
                        </v-card-item>

                        <v-divider></v-divider> <!-- Divider between icon and title -->

                        <v-card-item class="text-center">
                        <v-card-title>{{ page.title }}</v-card-title>
                        </v-card-item>
                    </v-card>
                    </v-col>
                </v-row>
                </v-card>
            </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

// Define the list of pages dynamically
const pages = [
  { title: "Notices", icon: "mdi-message-text", route: "/communication/my-notices" },
  { title: "Complaints", icon: "mdi-alert-circle", route: "/communication/my-complaints" },
  { title: "Apply Vacation", icon: "mdi-home", route: "/communication/apply-vacation" },
  { title: "Bulk Communication", icon: "mdi-email-multiple", route: "/communication/comms" },
];

const handleSectionSelection = (route: string) => {
    router.push(route);
};
</script>

<style scoped>

.section-card {
    border: 2px solid green;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
}

.section-card:hover {
    background-color: rgba(0, 128, 0, 0.1);
    box-shadow: 0px 4px 10px rgba(0, 128, 0, 0.3);
}

.v-card-title {
    font-size: 16px;
}
</style>