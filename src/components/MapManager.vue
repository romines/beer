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
            <div class="id">id: {{map.id}}</div>
            <div class="toggle-container">
              <label for="active" class="switch" @click.stop.prevent="toggleActive(map.id, !map.active)">
                <input id="active" type="checkbox" v-model="map.active" />
                <span class="slider round" />
              </label>
            </div>
            <div class="map-actions">
              <span>remove</span>
              <span>replace</span>
            </div>
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
  data() {
    return {
      editingNameAtIndex: -1,
      nameDraft: '',
    }
  },
  props: {
    pathPrefix: {
      type: String,
    },
  },
  computed: mapState({
    maps: state => state.resortMeta.maps,
    numActive: state => {
      if (!this.maps) return 0
      return this.maps.filter(map => map.active).length
    }
  }),
  methods: {
    onMapFileUpload(a, b, c) {},
    toggleActive(id, val) {
      if (val &&  numActive > 1) alert('active  map limit warning')
      console.log({id, val});
    }
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
