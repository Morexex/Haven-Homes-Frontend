import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    isDisplayToggled: false,
    isConfigHidden: false,
  }),
  actions: {
    toggleEveryDisplay() {
      this.isDisplayToggled = !this.isDisplayToggled;
    },
    toggleHideConfig() {
      this.isConfigHidden = !this.isConfigHidden;
    },
  },
});
