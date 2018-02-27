<template>
  <div class="main">

    <h1 class="title">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
      <span class="page-title">
        Contact Management
      </span>
    </h1>
    <!-- <div>
      <button @click="init">Initialize app base state</button>
    </div> -->
    <ul class="contact-group-list">
      <li
        class="contact-group"
        :class="detailGroup === group.section ? 'box' : ''"
        v-for="(group, groupIndex) in contactGroups"
        :key="group.section">
        <div
          class="group-header"
          :class="detailGroup === group.section ? '' : 'box'"
          @click="detailGroup = (detailGroup === group.section) ? '' : group.section; editingContactAtIndex = -1">
          <span class="name">{{ group.section }}</span>
          <span class="icon is-small" v-show="detailGroup !== group.section">
            <i class="fas fa-chevron-down"/>
          </span>
          <span class="icon is-small" v-show="detailGroup === group.section">
            <i class="fas fa-chevron-up"/>
          </span>
        </div>
        <div
          class="group-detail"
          v-show="detailGroup === group.section">

          <ul class="contact-list">
            <li
              :class="editingContactAtIndex === index ? 'box' : ''"
              v-for="(contact, index) in group.list">
              <div
                class="contact-header"
                :class="editingContactAtIndex === index ? '' : 'box'"
                @click.stop="(editingContactAtIndex === index) ? editingContactAtIndex = -1 : editingContactAtIndex = index">
                <span class="name">{{ contact.name }}</span>
                <span class="icon is-small" v-show="editingContactAtIndex !== index">
                  <i class="fas fa-chevron-down"/>
                </span>
                <span class="icon is-small" v-show="editingContactAtIndex === index">
                  <i class="fas fa-chevron-up"/>
                </span>
              </div>

              <edit-contact
                v-show="editingContactAtIndex === index"
                :group-index="groupIndex"
                :contact-index="index"
                :contact="contact"
                @cancelEdits="editingContactAtIndex = -1"/>
            </li>
          </ul>

        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import EditContact from './EditContact'

export default {
  components: {
    EditContact
  },
  data () {
    return {
      detailGroup: '',
      editingContactAtIndex: -1
    }
  },
  computed: {
    ...mapState([
      'contactGroups'
    ])
  },
  created () {
  },
  methods: {
    init () {
      this.$store.dispatch('seed')
    },

  }
}
</script>

<style scoped>
  /* .contact-group, .contact {
    padding: .6em;
  } */
  .main {
    /* border: 1px solid #777; */
    max-width: 772px;
    margin: 0 auto;

  }
  .title {
    display: flex;
    justify-content: space-around;
  }
  .group-header, .contact-header {
    display: flex;
    justify-content: space-between;
  }
  .contact {
    border: 1px solid #777;
  }
</style>
