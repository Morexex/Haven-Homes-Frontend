export default [
    {
      path: '/tenants',
      children: [
        {
          path: '',
          name: 'list-tenants',
          component: () => import('@/modules/tenants/pages/ListTenants.vue'),
        },
        {
          path: 'view/:id',
          name: 'view-tenant',
          component: () => import('@/modules/tenants/pages/ViewTenants.vue'),
          props: true,
        },
        {
          path: 'update/:id',
          name: 'update-tenant',
          component: () => import('@/modules/tenants/pages/UpdateTenants.vue'),
          props: true,
        },
      ],
    },
  ];
  