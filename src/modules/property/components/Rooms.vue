<template>
  <HeaderTitle
    title="Properties"
    searchPlaceholder="Search Properties"
    showSearch
    :buttons="[
      { text: 'Add Room', event: 'add-room', color: 'green', icon: 'plus' },
      { text: 'Add Category', event: 'add-category', color: 'orange', icon: 'plus' },
    ]"
    @update:search="updateSearchQuery"
    @button-click="handleButtonClick"
  />
  <!-- Register Dialogs Component -->
  <AddCategoryModal v-model:dialog="categoryDialog" @category-added="refreshCategories" />
  <AddRoomModal v-model:dialog="dialog" @room-added="refreshRooms" />
</template>

<script lang="ts">
import { ref, } from "vue";
import HeaderTitle from "./HeaderTitle.vue";
import AddCategoryModal from "./AddCategoryModal.vue";
import AddRoomModal from "./AddRoomModal.vue";
export default {
  components: { HeaderTitle, AddCategoryModal, AddRoomModal },
  setup() {
    const searchQuery = ref("");
    const dialog = ref(false);
    const categoryDialog = ref(false);
    // Function to Update Search Query
    const updateSearchQuery = (query: string) => {
      searchQuery.value = query;
    };
    // Open Add Property Modal
    const handleButtonClick = (event: string) => {
      if (event === "add-room") {
        dialog.value = true;
      } else if (event === "add-category") {
        categoryDialog.value = true;
      }
    };
    const refreshCategories = () => {
      console.log("Category added! Refreshing...");
      // Here, you can fetch updated categories if needed
    };

    const refreshRooms = () => {
      console.log("Room added successfully, refresh rooms list...");
    };
    return {
      updateSearchQuery,
      handleButtonClick,
      refreshCategories,
      refreshRooms,
      dialog,
      categoryDialog,
    };
  },
};
</script>
