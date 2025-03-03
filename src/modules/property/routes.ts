export default [
  {
    path: "/properties",
    children: [
      {
        path: "",
        name: "list-properties",
        component: () => import("@/modules/property/pages/ListProperties.vue"),
        meta: {
          breadcrumb: "Properties",
        },
      },
      {
        path: "update/:id",
        name: "update-property",
        component: () => import("@/modules/property/pages/UpdateProperty.vue"),
        meta: {
          breadcrumb: "Update Property",
        },
        props: true,
      },
    ],
    meta: {
      breadcrumb: "Properties Management",
    },
  },
  {
    path: "/property", // Separate route for viewing a property
    children: [
      {
        path: "view",
        name: "view-property",
        component: () => import("@/modules/property/pages/ViewProperty.vue"),
        props: true,
        meta: {
          breadcrumb: "View Property",
        },
      },
      {
        path: "/property/:id/images",
        name: "ManagePropertyImages",
        component: () =>
          import("@/modules/property/components/ManagePropertyImages.vue"),
        props: true,
      },
      {
        path: "/room/:id/images",
        name: "ManageRoomImages",
        component: () =>
          import("@/modules/property/components/ManageRoomImages.vue"),
        props: true,
      },
      {
        path: "/rooms/:id",
        name: "RoomDetails",
        component: () =>
          import("@/modules/property/components/RoomDetails.vue"),
        props: true,
      },
      {
        path: '/view-user/:type',  // "type" can be "tenant" or "staff"
        name: 'ViewUserPage',
        component: () => import('@/modules/property/components/ViewUserDetails.vue'),
        props: (route: { params: { type: string } }) => ({ type: route.params.type }) // Allow route to pass type as a prop
      }
    ],
  },
];
