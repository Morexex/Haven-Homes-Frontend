<template>
    <v-dialog v-model="isOpen" max-width="400" persistent>
      <v-card class="pa-4 text-center">
        <!-- Fancy Warning Icon -->
        <v-icon size="64" color="red" class="mb-3">mdi-alert-circle-outline</v-icon>
        
        <v-card-title class="text-h5 font-weight-bold">{{ title }}</v-card-title>
        <v-card-text class="text-body-1 text-grey-darken-1">{{ message }}</v-card-text>
        <!-- introduce an optional textarea -->
         <v-textarea v-if="showTextarea" v-model="textarea" :label="textareaLabel" variant="outlined"></v-textarea>
        <v-card-actions class="justify-center mt-4">
          <v-btn color="grey darken-2" variant="outlined" @click="handleCancel">
            <v-icon left>mdi-close</v-icon>
            {{ cancelText }}
          </v-btn>
          <v-btn color="red" dark @click="handleConfirm">
            <v-icon left>mdi-delete</v-icon>
            {{ confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits, ref, watch } from "vue";
  
  const props = defineProps({
    modelValue: Boolean, // Controls dialog visibility
    title: { type: String, default: "Are you sure?" },
    message: { type: String, default: "Do you really want to perform this action?" },
    confirmText: { type: String, default: "Confirm" },
    cancelText: { type: String, default: "Cancel" },
    showTextarea: { type: Boolean, default: false },
    textareaLabel: { type: String, default: "Reason" },
  });

  const textarea = ref("");
  
  const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);
  const isOpen = ref(props.modelValue);
  
  watch(
    () => props.modelValue,
    (newValue) => {
      isOpen.value = newValue;
    }
  );
  
  const handleCancel = () => {
    emit("update:modelValue", false);
    emit("cancel");
  };
  
  const handleConfirm = () => {
    emit("update:modelValue", false);
    emit("confirm");
  };
  </script>
  
  <style scoped>
  .v-card {
    border-radius: 12px;
  }
  </style>