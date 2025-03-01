export default [
  {
    path: '/properties',
    children: [
      {
        path: '',
        name: 'list-properties',
        component: () => import('@/modules/property/pages/ListProperties.vue'),
        meta: {
          breadcrumb: 'Properties'
        }
      },
      {
        path: 'update/:id',
        name: 'update-property',
        component: () => import('@/modules/property/pages/UpdateProperty.vue'),
        meta:{
          breadcrumb: 'Update Property'
        },
        props: true
      }
    ],
    meta: {
      breadcrumb: 'Properties Management'
    }
  },
  {
    path: '/property', // Separate route for viewing a property
    children: [
      {
        path: 'view',
        name: 'view-property',
        component: () => import('@/modules/property/pages/ViewProperty.vue'),
        props: true,
        meta: {
          breadcrumb: 'View Property'
        }
      }
    ]
  }
]
