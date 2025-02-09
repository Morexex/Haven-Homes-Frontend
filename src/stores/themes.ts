import { defineStore } from "pinia";
import { ref } from "vue";
import { useTheme } from "vuetify";

export const useThemeStore = defineStore("theme", () => {
  const darkTheme = ref(false);
  const theme = useTheme();

  function toggleTheme() {
    darkTheme.value = !darkTheme.value;
    theme.global.name.value = darkTheme.value ? "dark" : "light";
  }

  return { darkTheme, toggleTheme };
});
