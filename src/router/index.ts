import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router"; // ✅ Use type-only import

import HomeView from "../views/HomeView.vue";
import propertyRoutes from "@/modules/property/routes";
import dashboardRoutes from "@/modules/dashboard/routes";
import commsRoutes from "@/modules/communication/routes";
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import { useAuthStore } from "@/stores/authStore";

// Define routes
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomeView,
        meta: { requiresAuth: true },
      },
      ...dashboardRoutes,
      ...propertyRoutes,
      ...commsRoutes,
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Auth/LoginView.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/Auth/RegisterView.vue"),
    meta: { requiresGuest: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard for Route Protection
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated; // Ensure this returns the correct state

  console.log("Auth Guard - isAuthenticated:", isAuthenticated); // Log the state for debugging

  if (to.name !== "login" && to.name !== "register" && !isAuthenticated) {
    next({ name: "login" }); // Redirect to login if not authenticated
  } else if (to.name === "login" && isAuthenticated) {
    next({ name: "dashboard" }); // Redirect to dashboard if already logged in
  } else {
    next(); // Allow navigation
  }
});

export default router;
