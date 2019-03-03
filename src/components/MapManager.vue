<template class="map-manager">
  <div class="field is-horizontal">
    <div class="field-label is-normal"><label class="label">Map Files</label></div>
    <div class="field-body manage-maps">
      <div class="control">
        <div class="map-thumbs">
          <div class="image-container" v-for="(url, index) in mapFiles" :key="url">
            <span class="icon is-small remove" @click="$emit('removeMap', { url, index })">
              <i class="fas fa-times-circle" />
            </span>
            <img :src="url" />
            <div class="remove-image" @click="$emit('removeMap', { url, index })">remove map</div>
            <div class="meta" v-if="$route.name === 'Maps'">This shows on /maps</div>
          </div>
        </div>

        <image-upload
          file-name-prefix="map_"
          :path-prefix="`${pathPrefix}/map_files/`"
          button-label="Add a map..."
          @uploadComplete="onMapFileUpload"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ImageUpload from './ImageUpload.vue'
import { mapState } from 'vuex'
export default {
  components: {
    ImageUpload,
  },
  props: {
    pathPrefix: {
      type: String,
    },
  },
  computed: mapState({
    mapFiles: state => state.resortMeta.mapFiles,
  }),
  methods: {
    onMapFileUpload() {},
  },
}
</script>

<style scoped lang="scss">
.manage-maps {
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
      img {
        border: 1px solid #cecece;
        border-radius: 3px;
      }
    }
  }
}
</style>
