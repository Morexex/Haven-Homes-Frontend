export default [
  {
    path: '/properties',
    children: [
      {
        path: '',
        name: 'list-properties',
        component: () => import('@/modules/property/pages/ListProperties.vue')
      },
      {
        path: 'update/:id',
        name: 'update-property',
        component: () => import('@/modules/property/pages/UpdateProperty.vue'),
        props: true
      }
    ]
  },
  {
    path: '/property', // Separate route for viewing a property
    children: [
      {
        path: 'view',
        name: 'view-property',
        component: () => import('@/modules/property/pages/ViewProperty.vue'),
        props: true
      }
    ]
  }
]
