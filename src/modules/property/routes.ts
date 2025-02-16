export default [
    {
      path: '/properties',
      children: [
        {
          path: '',
          name: 'list-properties',
          component: () => import('@/modules/property/pages/ListProperties.vue'),
        },
        {
          path: 'view/:id',
          name: 'view-property',
          component: () => import('@/modules/property/pages/ViewProperty.vue'),
          props: true,
        },
        {
          path: 'update/:id',
          name: 'update-property',
          component: () => import('@/modules/property/pages/UpdateProperty.vue'),
          props: true,
        },
      ],
    },
  ];
  