<template>
  <div class="field-body map-manager">
    <div class="control">
      <div class="map-thumbs">
        <div class="image-container" v-for="(map, id) in availableMaps" :key="id">
          <span class="icon is-small remove" @click="removeMap(id)">
            <i class="fas fa-times-circle" />
          </span>
          <img :src="map.url" />
          <div class="remove-image" @click="removeMap(id)">remove map</div>
        </div>
      </div>

      <image-upload
        file-name-prefix="map_"
        :path-prefix="`${$store.state.resortId}/map_files/`"
        button-label="Add a map..."
        @uploadComplete="onUploadComplete"
      />
    </div>
  </div>
</template>

<script>
const mock = {
  // available maps property saved at resort level
  availableMaps: {
    1522428739473: {
      name: 'Winter 2018/19',
      url:
        'https://firebasestorage.googleapis.com/v0/b/rta-staging.appspot.com/o/jackson_hole%2Fmap_files%2Fmap_1545432513588.png?alt=media&token=10b69920-b40f-4111-842c-06329810beb6',
      active: true,
    },
    1522428745001: {
      name: 'Summer 2018',
      url:
        'https://firebasestorage.googleapis.com/v0/b/rta-staging.appspot.com/o/jackson_hole%2Fmap_files%2Fmap_1538756862375.png?alt=media&token=befb9540-6498-441b-ae5a-caf9f1171e87',
      active: true,
    },
    1522146126814: {
      name: 'Winter 2017/18',
      url:
        'https://firebasestorage.googleapis.com/v0/b/rta-staging.appspot.com/o/jackson_hole%2Fmap_files%2Fmap_1545432513588.png?alt=media&token=10b69920-b40f-4111-842c-06329810beb6',
      active: false, // ie. will not display to regular user in CMS
    },
  },
}
import { ImageUpload } from './'
export default {
  components: {
    ImageUpload,
  },
  props: {
    mapFiles: Array,
    resortId: String,
  },
  data() {
    return { ...mock }
  },
  methods: {
    removeMap(url) {},
    onUploadComplete(foo, bar, baz) {
      debugger
    },
  },
}
</script>

<style scoped lang="scss">
.map-manager {
  display: block;
  .map-thumbs {
    display: flex;
    align-items: stretch;
    .image-container {
      position: relative;
      &:not(:first-child) {
        margin-left: 1em;
      }
      .remove {
        position: absolute;
        top: -7px;
        left: -7px;
      }
    }
  }
}
</style>
