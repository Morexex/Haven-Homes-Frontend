<template>
    <!-- Top Bar with Cancel Icon -->
    <v-row justify="space-between" align="center" class="mb-4">
        <v-col cols="10" class="pa-4">
            <h2>Notices</h2>
        </v-col>
        <v-col cols="2" class="text-right">
            <v-btn icon size="small" @click="$router.back()">
                <v-icon size="20">mdi-close</v-icon>
            </v-btn>
        </v-col>
    </v-row>

    <v-container fluid>
        <v-row>
            <v-col v-for="(status, index) in statuses" :key="status.value" cols="12" md="4"
                :class="{ 'border-right': index < statuses.length - 1 }">
                <v-card :color="status.color" class="pa-3 fill-height" elevation="6" :data-status="status.value">
                    <h3 class="text-white text-center">{{ status.label }}</h3>
                    <draggable v-model="groupedNotices[status.value]" group="notices" @end="onDragEnd" item-key="id">
                        <template #item="{ element }">
                            <v-card class="my-3 transition-swing" elevation="4">
                                <v-card-title class="d-flex justify-space-between">
                                    <div class="text-truncate" :title="element.title">
                                        {{ element.title }}
                                    </div>
                                    <v-chip size="x-small" color="primary" class="text-white">{{ element.type
                                        }}</v-chip>
                                </v-card-title>
                                <v-card-text>
                                    <div class="text-subtitle-2 text--primary">{{ element.message }}</div>
                                    <div class="text-caption mt-2 grey--text">
                                        From: <strong>{{ element.user_name }}</strong><br />
                                        Published: {{ element.published_at_formatted }}
                                    </div>
                                </v-card-text>
                            </v-card>
                        </template>
                    </draggable>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import draggable from "vuedraggable";
import apiClient from "@/services/apiClient";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";

interface Notice {
    id: number;
    title: string;
    message: string;
    status: string;
    type: string;
    user_name: string;
    published_at_formatted: string;
}

const authStore = useAuthStore();
const notices = ref<Notice[]>([]);
const toast = useToast();
const loading = ref(false);

const statuses = [
    { value: "Unread", label: "Unread", color: "deep-purple darken-1" },
    { value: "Read", label: "Read", color: "green darken-1" },
    { value: "Archive", label: "Archive", color: "grey darken-1" },
];

const getNoticesByStatus = (status: string) => {
    return notices.value?.filter((n) => n.status === status) || [];
};

const groupedNotices = ref<Record<string, Notice[]>>({
    Unread: [],
    Read: [],
    Archive: [],
});


const onDragEnd = async (event: any) => {
    const { to, item } = event;
    const newStatus = to.closest(".v-card")?.getAttribute("data-status");
    if (!newStatus) return;

    // Update the status in the item itself
    item.status = newStatus;

    try {
        const onDragEnd = async (event: any) => {
            const { to, notice } = event;
            const newStatus = to.closest(".v-card")?.getAttribute("data-status");
            if (!newStatus) return;

            // Update the status in the item itself
            notice.status = newStatus;

            try {
                await apiClient.put(`/notices/${item.id}`, { status: newStatus }, {
                    headers: { "Property-Code": authStore.propertyCode },
                });
                toast.success(`Notice moved to ${newStatus} successfully!`);
            } catch (error) {
                toast.error("Failed to update notice status.");
            }
        };
        toast.success(`Notice moved to ${newStatus} successfully!`);
    } catch (error) {
        toast.error("Failed to update notice status.");
    }
};

const fetchNotices = async () => {
    try {
        const { data } = await apiClient.get(`/notices`, {
            headers: { "Property-Code": authStore.propertyCode },
        });

        // group notices by status
        groupedNotices.value = { Unread: [], Read: [], Archive: [] };
        for (const n of data) {
            groupedNotices.value[n.status].push(n);
        }
    } catch (error) {
        toast.error("Failed to load notices.");
    }
};

onMounted(() => {
    fetchNotices();
});
</script>


<style scoped>
.border-right {
    border-right: 2px solid #ddd;
    /* You can use Vuetify theme colors too */
}

.text-truncate {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: default;
}

:deep(.sortable-chosen) {
    opacity: 0.7;
}

:deep(.sortable-drag) {
    opacity: 0.5;
    background: #f0f0f0;
    transform: rotate(2deg);
}

:deep(.sortable-ghost) {
    opacity: 0.3;
}
</style>