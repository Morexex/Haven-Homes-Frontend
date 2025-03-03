<template>
    <v-container class="py-5">
        <v-card class="elevation-4 rounded-xl pa-6 mx-auto" max-width="600">
            <v-card-title class="text-h5 font-weight-bold text-center" style="color: green;">
                <v-icon color="green" class="mr-2">mdi-account-circle</v-icon>
                {{ pageTitle }}
            </v-card-title>

            <v-divider class="my-3"></v-divider>

            <v-container fluid>
                <v-row v-for="(value, key) in userInfo" :key="key" align="center">
                    <v-col cols="2" class="d-flex justify-center">
                        <v-icon size="24" class="text-green">{{ getIcon(key) }}</v-icon>
                    </v-col>
                    <v-col cols="4" class="text-uppercase font-weight-medium text-grey-darken-1">
                        {{ formatLabel(key) }}
                    </v-col>
                    <v-col cols="6" class="text-body-1 font-weight-bold text-grey-darken-3">
                        {{ value || 'N/A' }}
                    </v-col>
                    <v-divider class="my-1 mx-4" v-if="key !== 'Status'"></v-divider>
                </v-row>
            </v-container>

            <v-divider class="my-4"></v-divider>

            <v-card-actions class="justify-center">
                <v-btn color="green" variant="elevated" @click="goBack">
                    <v-icon left>mdi-arrow-left</v-icon> Back
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const router = useRouter();

const type = computed(() => route.params.type); // "tenant" or "staff"

const pageTitle = computed(() => type.value === "tenant" ? "Tenant Details" : "Staff Details");

const userInfo = computed(() => ({
    ID: route.query.id,
    Name: route.query.name,
    Email: route.query.email,
    Phone: route.query.phone,
    Role: route.query.role,
    Room: type.value === "tenant" ? route.query.room_id : undefined,
    Status: route.query.status
}));

const formatLabel = (label: string) => label.replace(/_/g, " ");

const goBack = () => router.back();

const getIcon = (key: string) => {
    const icons: { [key: string]: string } = {
        ID: "mdi-card-account-details",
        Name: "mdi-account",
        Email: "mdi-email",
        Phone: "mdi-phone",
        Role: "mdi-account-tie",
        Room: "mdi-door",
        Status: "mdi-toggle-switch"
    };
    return icons[key] || "mdi-information";
};
</script>

<style scoped>
.text-h5 {
    color: #1e88e5;
}
.v-card {
    transition: transform 0.3s ease-in-out;
}
.v-card:hover {
    transform: scale(1.02);
}
</style>
