<template>
  <transition name="modal">
    <div class="modal-mask" v-show="show" v-on:click="closeModal">
      <div class="modal-wrapper">
        <div class="modal-container" v-bind:style="{ width: modalWidth + '%' }">
          <button v-bind:class="{ hideMobile : hideCloseMobile }" class="modal-close-button" v-on:click="$emit('close')">
            <img src="../../assets/icons/close-x.svg">
          </button>

          <slot></slot>

        </div>
      </div>
    </div>
  </transition>
</template>

<script>


export default {
  name: 'GenericModal',
  props: {
    show: {
      type:     Boolean,
      default:  false
    },
    hideCloseMobile: {
      type:     Boolean,
      default:  false
    },
    width: {
      type:     Number,
      default:  50
    }
  },
  data () {
    return {
      modalWidth: this.width
    }
  },
  mounted () {
    document.addEventListener('keydown', (e) => {
      if (this.show && e.keyCode === 27) {
        this.$emit('close')
      }
    })
    window.addEventListener('resize', () => {
      this.setModalWidth()
    })
  },
  created () {
    this.setModalWidth()
  },
  methods: {
    closeModal (event) {
      if (!event.target.closest('.modal-container')) this.$emit('close')
    },
    setModalWidth () {
      if (window.innerWidth < 768) {
        this.modalWidth = 100
      } else {
        this.modalWidth = this.width
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.modal-mask {
  position:                       fixed;
  z-index:                        999999;
  top:                            0;
  left:                           0;
  right:                          0;
  bottom:                         0;
  width:                          100%;
  height:                         100%;
  background-color:               rgba(0, 0, 0, .5);
  display:                        table;
  transition:                     opacity .3s ease;
}

.modal-wrapper {
  display:                        table-cell;
  vertical-align:                 middle;
}

.modal-container {
  width:                          50%;
  margin:                         0 auto;
  padding:                        2em;
  background-color:               #fff;
  border-radius:                  1em;
  box-shadow:                     0 2px 8px rgba(0, 0, 0, .33);
  transition:                     all .3s ease;
  position:                       relative;

  .modal-close-button {
    background:                   none;
    border:                       none;
    position:                     absolute;
    right:                        16px;
    top:                          16px;
    width:                        16px;
    height:                       16px;
    padding:                      0;

    > img {
      width:                      100%;
      height:                     100%;
      cursor:                     pointer;
      vertical-align:             top;
    }
  }
}


/* Landscape phone to portrait tablet */
@media (max-width: 767px) {

  .modal-wrapper {
    display:                        block;
    position:                       fixed;
    bottom:                         0;
    width:                          100%;
  }

  .modal-container {
    width:                          100%;
    margin:                         0 auto;
    padding:                        2em 1.5em;
    background-color:               #fff;
    border-radius:                  0;
    transition:                     all .3s ease;

    .hideMobile {
      display:                      none;
    }
  }
}


</style>
