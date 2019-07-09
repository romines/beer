<template class="map-manager">
  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">Map Files</label>
    </div>
    <div class="field-body manage-maps">
      <div class="control">
        <div class="map-thumbs">
          <div class="image-container" v-for="(map, index) in maps" :key="map.id">
            <span class="icon is-small remove" @click="$emit('removeMap', map.id)">
              <i class="fas fa-times-circle" />
            </span>
            <img :src="map.url" />
            <div class="name" v-if="editingNameAtIndex !== index">{{map.name}}</div>
            <div class="edit-name" v-if="editingNameAtIndex === index">
              <input type="text" v-model="nameDraft" />
            </div>
            <slot v-bind:map="map"></slot>
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
import moment from 'moment'
import { mapState } from 'vuex'
export default {
  components: {
    ImageUpload,
  },
  data() {
    return {
      editingNameAtIndex: -1,
      nameDraft: '',
    }
  },
  props: {
    maps: {
      type: Array,
    },
    pathPrefix: {
      type: String,
    },
  },
  methods: {
    onMapFileUpload({ id, url }) {
      this.$emit('mapUpload', {
        id,
        url,
        name:`Map file - ${moment(parseInt(id)).format('MMMM Do, YYYY')}`
      })
    },

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
      & > *:not(.icon) {
        min-height: 25px;
        display: flex;
        align-items: center;
        }
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
    .map-actions {
      font-size: 0.9em;
      span {
        cursor: pointer;
        margin-right: 1.6em;
      }
    }
  }
}
</style>
