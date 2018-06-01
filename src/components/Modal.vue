<template lang="html">
  <div class="modal" :class="applicableClasses">
    <div class="modal-background" @click="close" />

    <div class="modal-content animated" :class="animationClass" @click.stop>
      <div class="box">
        <div class="title is-5">
          {{ contents.heading }}
        </div>
        <div class="body">
          <div class="contents">{{ contents.message }}</div>
          <div class="field is-grouped" v-show="!contents.buttonLess">
            <p class="control no-expando confirm">
              <a class="button is-primary" @click="onConfirm" :class="{ 'is-loading': contents.loading }">
                {{ contents.confirmButtonLabel ? contents.confirmButtonLabel : 'Confirm' }}
              </a>
            </p>
            <p class="control no-expando cancel" v-if="!contents.hideCancel">
              <a class="button is-light" @click="onCancel">
                {{ contents.cancelButtonLabel ? contents.cancelButtonLabel : 'Cancel' }}
              </a>
            </p>
          </div>
        </div>

      </div>

    </div>
  </div>

</template>

<script>

export default {
  data () {
    return {
      animationClass: '',
      localState: {
        show: false
      }
    }
  },
  computed: {
    show () {
      return this.$store.state.modal.show
    },
    contents () {
      return this.$store.state.modal.contents
    },
    applicableClasses () {
      let stylesObj = {
        'is-active': this.localState.show
      }
      if (this.$store.state.modal.contents.classList) {
        this.$store.state.modal.contents.classList.forEach(className => { stylesObj[className] = true })
      }
      return stylesObj
    }
  },
  watch: {
    show (show) {
      // proxy some local state based on value from vuex store so that we can set animation class first
      if (show) {
        this.localState.show = show
        this.animationClass = ''
      } else {
        this.animationClass = 'fadeOut'
        setTimeout(() => { // TODO (?) this could be replaced with a callback on animation complete...
          this.localState.show = show
        }, 850);
      }
    }
  },
  methods: {
    close () {
      this.$store.commit('CLOSE_MODAL')
    },
    onConfirm () {
      if (typeof this.$store.state.modal.contents.onConfirm === 'function') this.$store.state.modal.contents.onConfirm()
    }

    , onCancel () {
      if (typeof this.$store.state.modal.contents.onCancel === 'function') this.$store.state.modal.contents.onCancel()
      this.close()
    }

  }
}
</script>

<style lang="scss">
  @import '../sharedStyles.scss';

  .title {
    justify-content: flex-start;
  }
  .contents {
    margin-bottom: 1em;
  }
  .error {
    .confirm {
      display: none;
    }
    .cancel .button {
      background-color: #776565;
      color: white;
      border-radius: 3px;
    }
    .title {
      color: $errorRed;
    }
  }

</style>