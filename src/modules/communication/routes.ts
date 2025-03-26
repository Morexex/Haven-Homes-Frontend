export default [
  {
    path: "/communication",
    children: [
      {
        path: "",
        name: "list-comms",
        component: () => import("@/modules/communication/pages/ListComms.vue"),
        meta: {
          breadcrumb: "Properties",
        },
      },
    ],
  },
  {
    path: "/notices", // Separate route for viewing notices
    children: [
      {
        path: "my-notices",
        name: "view-notices",
        component: () =>
          import("@/modules/communication/pages/ViewNotices.vue"),
        props: true,
      },
    ],
  },
  {
    path: "/complaints", // Separate route for viewing complaints
    children: [
      {
        path: "my-complaints",
        name: "view-complaints",
        component: () =>
          import("@/modules/communication/pages/ViewComplaints.vue"),
        props: true,
      },
    ],
  },
  {
    path: "/vacation", // Separate route for viewing vacation
    children: [
      {
        path: "apply-vacation",
        name: "apply-vacation",
        component: () =>
          import("@/modules/communication/pages/ApplyVacation.vue"),
        props: true,
      },
    ],
  },
  {
    path: "/bulk-communication", // Separate route for viewing bulk communication
    children: [
      {
        path: "comms",
        name: "bulk-communication",
        component: () =>
          import("@/modules/communication/pages/BulkCommunication.vue"),
        props: true,
      },
    ],
  },
];
