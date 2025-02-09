import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import tenantRoutes from '@/modules/tenants/routes';
import dashboardRoutes from '@/modules/dashboard/routes';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const routes = [
  // Main layout for root and child routes
  {
    path: '/',
    component: DefaultLayout,  // Only apply DefaultLayout here
    children: [
      { path: '', name: 'home', component: HomeView },
      ...tenantRoutes,   // Tenant routes will inherit DefaultLayout
      ...dashboardRoutes, // Dashboard routes will inherit DefaultLayout
    ],
  },
  // Separate route for login and register, without DefaultLayout
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Auth/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Auth/RegisterView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
