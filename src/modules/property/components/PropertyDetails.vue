<template>
  <v-card class="mx-auto" rounded="0">
    <!-- logo area -->
    <v-avatar color="grey" rounded="0" size="150">
      <v-img src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg" cover></v-img>
    </v-avatar>
    <v-list-item
      subtitle="Kwa mabubu Nakuru"
      title="Kaptembwa Flats"
    ></v-list-item>
  </v-card>
  <VBreadcrumbsDivider></VBreadcrumbsDivider>
  <h2 class="text-h5 font-weight-bold">Property Images</h2>
  <v-row>
    <v-col
      v-for="n in 9"
      :key="n"
      class="d-flex child-flex"
      cols="4"
    >
      <v-img
        :lazy-src="`https://picsum.photos/10/6?image=${n * 5 + 10}`"
        :src="`https://picsum.photos/500/300?image=${n * 5 + 10}`"
        aspect-ratio="1"
        class="bg-grey-lighten-2"
        cover
      >
        <template v-slot:placeholder>
          <v-row
            align="center"
            class="fill-height ma-0"
            justify="center"
          >
            <v-progress-circular
              color="grey-lighten-5"
              indeterminate
            ></v-progress-circular>
          </v-row>
        </template>
      </v-img>
    </v-col>
  </v-row>
</template>
