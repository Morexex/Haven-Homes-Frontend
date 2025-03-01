import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";
import { useEventBus } from "@/composables/EventBus";

const eventBus = useEventBus(); // Initialize event bus for emitting login modal events

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("auth_token") || "",
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch (error) {
        console.error("Error parsing user data:", error);
        return {};
      }
    })(),
    propertyCode: localStorage.getItem("property_code") || "",
    sessions: JSON.parse(localStorage.getItem("sessions") || "{}") as Record<string, boolean>,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getSessionForProperty: (state) => (propertyCode: string) => state.sessions[propertyCode] || false,
  },

  actions: {
    /**
     * ✅ Set authentication data and store it locally
     */
    setAuthData(token: string, user: object, propertyCode: string) {
      // Check if there's an old property session and clear it
      if (this.propertyCode && this.propertyCode !== propertyCode) {
        this.clearSessionForProperty(this.propertyCode); // Clear previous session
      }
    
      this.token = token;
      this.user = user;
      this.propertyCode = propertyCode;
    
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user || {}));
      localStorage.setItem("property_code", propertyCode);
    
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
      // ✅ Ensure session is updated for the new property
      this.setSessionForProperty(propertyCode);
    },
    
    clearSessionForProperty(propertyCode: string) {
      if (this.sessions[propertyCode]) {
        delete this.sessions[propertyCode];
        localStorage.setItem("sessions", JSON.stringify(this.sessions));
      }
    },    

    /**
     * ✅ Manage session state per property
     */
    setSessionForProperty(propertyCode: string) {
      this.sessions[propertyCode] = true;
      localStorage.setItem("sessions", JSON.stringify(this.sessions));
    },

    /**
     * ✅ Load session state from localStorage
     */
    loadSessionsFromStorage() {
      this.sessions = JSON.parse(localStorage.getItem("sessions") || "{}");
    },

    /**
     * ✅ Clear authentication data
     */
    clearAuthData() {
      this.token = "";
      this.user = {};
      this.propertyCode = "";

      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("property_code");
      localStorage.removeItem("sessions");

      delete axios.defaults.headers.common["Authorization"];
    },

    /**
     * ✅ Check Authentication Status
     * - If logged into the same property → Redirect to dashboard
     * - If switching properties → Clear session & force login
     * - If not logged in → Open login modal
     */
    checkAuthStatus(propertyCode: string) {
      if (this.isAuthenticated) {
        if (this.propertyCode === propertyCode) {
          router.push("/dashboard"); // ✅ Already logged into the property, redirect
        } else {
          this.clearAuthData(); // ✅ Switching properties, clear session
          eventBus.emit("open-login-modal"); // ✅ Trigger login modal
        }
      } else {
        eventBus.emit("open-login-modal"); // ✅ Not logged in, prompt login
      }
    },

    /**
     * ✅ Login function to authenticate user
     */
    async login(credentials: { email: string; password: string }) {
      try {
        const { data } = await axios.post("/api/login", credentials);
        this.setAuthData(data.token, data.user, data.propertyCode);
        router.push("/dashboard");
      } catch (error: any) {
        console.error("Login failed:", error.response?.data || error.message);
        throw error;
      }
    },

    /**
     * ✅ Logout function to clear auth data and redirect
     */
    logout() {
      this.clearAuthData();
      router.push("/login");
    },

    /**
     * ✅ Fetch updated user data (if already logged in)
     */
    async fetchUser() {
      if (!this.token) return;

      try {
        const { data } = await axios.get("/api/user");
        this.user = data;
        localStorage.setItem("user", JSON.stringify(data));
      } catch (error: any) {
        console.error(
          "Failed to fetch user data:",
          error.response?.data || error.message
        );
        this.logout();
      }
    },
  },
});
