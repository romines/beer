<template>
  <div class="list-push">
    <h2 class="subtitle">Push History</h2>

    <div class="push-notifications">
      <LoadingSpinner v-if="isLoadingPushes" isBlack="true"></LoadingSpinner>
      <div v-else-if="pushNotifications.length == 0" class="no-messages">No messages to display.</div>
      <div v-else v-for="notification in pushNotifications" class="notification-container">
        <div class="header" @click="showNotificationDetails(notification)">
          <span class="id">{{notification.id}}</span>
          <span class="message-content">{{ displayMessageContent(notification) }}</span>
          <span class="send-date">{{notification.sendDate}}</span>
        </div>
        <div v-if="showNotification(notification.id)" class="body">
          <LoadingSpinner v-if="isLoadingNotification" isBlack="true"></LoadingSpinner>
          <div v-else class="message-details">
            <div class="detail created">
              <label>Created At:</label><span class="created">{{currentNotification.created}}</span>
            </div>
            <div class="detail send-date">
              <label>Sent At:</label><span class="send-date">{{currentNotification.sendDate}}</span>
            </div>
            <div class="detail is-silent">
              <label>In-App?:</label><span class="is-silent">{{currentNotification.isSilent ? 'Yes' : 'No'}}</span>
            </div>
            <div class="detail platforms">
              <label>Platforms:</label>
              <span class="platforms">
                <img v-on:click="showMsgStatsModal = true" v-for="platformId in currentNotification.platforms" v-bind:src="getDeviceImage(platformId)" class="device-image">
              </span>
            </div>
            <div class="detail status">
              <label>Status:</label><span class="status-note" v-bind:class="[currentNotification.status]">{{currentNotification.status}}</span>
            </div>

            <div class="detail message-title">
              <label>Title:</label>
              <span v-if="currentNotification.title || currentNotification.data.title" class="status-note">{{currentNotification.title || currentNotification.data.title }}</span>
              <span v-else>None provided</span>
            </div>
            <div class="detail message-content">
              <label>Message:</label><span class="message-content">{{ currentNotification.data.message || currentNotification.content.default }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>


    <GenericModal
      v-on:close="showMsgStatsModal = false"
      v-bind:show="showMsgStatsModal"
      v-bind:hideCloseMobile="true"
      class="msg-stats-modal">

      <button v-if="currentPendingRequestId" v-on:click="getMsgStatResults(currentPendingRequestId)" class="button is-primary">Refresh</button>

      <h2>iOS</h2>
      <div class="detail statistic">
        <label>Sent to:</label>
        <span v-if="isLoadingMsgStats" class="loading">loading...</span>
        <span v-else class="stat">{{notificationPlatformStats['1']['send']}}</span>
      </div>
      <div class="detail statistic">
        <label>Delivered to:</label>
        <span v-if="isLoadingMsgStats" class="loading">loading...</span>
        <span v-else class="stat">{{notificationPlatformStats['1']['delivery']}}</span>
      </div>
      <div class="detail statistic">
        <label>Open Count:</label>
        <span v-if="isLoadingMsgStats" class="loading">loading...</span>
        <span v-else class="stat">{{notificationPlatformStats['1']['open']}}</span>
      </div>

      <h2>Android</h2>
      <div class="detail statistic">
        <label>Sent to:</label>
        <span v-if="isLoadingMsgStats" class="loading">loading...</span>
        <span v-else class="stat">{{notificationPlatformStats['3']['send']}}</span>
      </div>
      <div class="detail statistic">
        <label>Delivered to:</label>
        <span v-if="isLoadingMsgStats" class="loading">loading...</span>
        <span v-else class="stat">{{notificationPlatformStats['3']['delivery']}}</span>
      </div>
      <div class="detail statistic">
        <label>Open Count:</label>
        <span v-if="isLoadingMsgStats" class="loading">loading...</span>
        <span v-else class="stat">{{notificationPlatformStats['3']['open']}}</span>
      </div>

    </GenericModal>

  </div>
</template>

<script>

import LoadingSpinner from '../utilities/LoadingSpinner.vue'
import GenericModal from '../utilities/GenericModal.vue'
import moment from 'moment'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { functionsBaseUrl } from '../../firebaseInit.js'

export default {
  components: {
    LoadingSpinner,
    GenericModal
  },
  data() {
    return {
      isLoadingPushes:            false,
      isLoadingNotification:      true,
      pushNotifications:          [],
      currentNotificationId:      null,
      currentNotification:        {},
      notificationPlatformStats:  {
        1: { 'send': 0, 'delivery': 0, 'open': 0 },
        2: { 'send': 0, 'delivery': 0, 'open': 0 },
        3: { 'send': 0, 'delivery': 0, 'open': 0 }
      },
      showMsgStatsModal:          false,
      currentRetryCount:          0,
      maxRetryCount:              10,
      currentPendingRequestId:    null,
      isLoadingMsgStats:          false
    }
  },
  computed: {
    ...mapGetters(['pushWooshData'])
  },
  created() {
    this.getPushNotifications()
    this.setBaseDistanceTagId()
  },
  methods: {
    getPushNotifications (skipLoading) {
      if (!skipLoading) this.isLoadingPushes = true

      let baseUrl = functionsBaseUrl + '/getPushNotifications'
      baseUrl += "?applicationCode=" + this.pushWooshData.appId

      this.axios.get(baseUrl).then((response) => {
        let body = JSON.parse(response.body)

        body.response.rows.map((notification) => {
          notification.sendDate = moment.utc(notification.sendDate).local().format('lll')
        })
        this.pushNotifications  = body.response.rows
        this.isLoadingPushes    = false
      })
    },
    setBaseDistanceTagId () {
      let baseUrl = functionsBaseUrl + '/getBaseDistance'
      baseUrl += "?applicationCode=" + this.pushWooshData.appId
      // baseUrl += "&tagName=basedistance"

      this.axios.get(baseUrl).then((response) => {
        let newRequestId  = response.data || null
        let oldRequestId  = this.pushWooshData.baseDistanceRequestIds.current ? this.pushWooshData.baseDistanceRequestIds.current : newRequestId

        this.pushWooshData.baseDistanceRequestIds = {
          current: newRequestId,
          former: oldRequestId
        }
        // Saves new request_id to "current" slot, bumps old id to "former" slot
        this.$store.dispatch('updatePushWooshData', this.pushWooshData)
      })
    },
    showNotificationDetails (notification) {
      // Check if opening or closing...
      if (this.currentNotificationId == notification.id) {
        this.currentNotificationId = null
        return
      } else {
        this.currentNotificationId = notification.id
      }

      this.getPushNotificationStats(notification)

      this.isLoadingNotification = true

      let baseUrl = functionsBaseUrl + '/getPushNotification'

      this.axios.get(baseUrl + "?messageId=" + notification.id).then((response) => {
        let body            = JSON.parse(response.body)
        let messageDetails  = body.response.message

        messageDetails.platforms  = JSON.parse(messageDetails.platforms)
        messageDetails.created    = moment.utc(messageDetails.created).local().format('lll')
        messageDetails.sendDate   = moment.utc(messageDetails.send_date).local().format('lll')

        if (messageDetails.data && messageDetails.data.default) {
          let parsed = JSON.parse(messageDetails.data.default)
          messageDetails.data = parsed
        }

        this.currentNotification    = messageDetails
        this.isLoadingNotification  = false
      })
    },
    getPushNotificationStats (notification) {
      let baseUrl = functionsBaseUrl + '/getMsgPlatformsStats'
      baseUrl += '?messageCode=' + notification.code
      this.isLoadingMsgStats = true
      this.currentRetryCount = 0      // Reset retry count on new open

      this.axios.get(baseUrl).then((response) => {
        let res         = JSON.parse(response.body)
        let requestId   = res.response.request_id
        this.getMsgStatResults(requestId)
      })
    },
    getMsgStatResults (requestId) {
      let baseUrl = functionsBaseUrl + '/getResults'
      baseUrl += '?requestId=' + requestId

      this.currentPendingRequestId = null
      this.isLoadingMsgStats = true

      this.axios.get(baseUrl).then((response) => {
        if (response.error) {
          if (this.currentRetryCount < this.maxRetryCount) {
            this.currentRetryCount += 1
            this.getMsgStatResults(requestId)
          } else {
            this.currentPendingRequestId = requestId
          }
        } else {
          // Reset pending retry values
          this.currentRetryCount        = 0
          this.currentPendingRequestId  = null

          let res = JSON.parse(response.body)

          this.setPlatformStats(res)

          this.isLoadingMsgStats = false
        }
      })
    },
    setPlatformStats (res) {
      // Just iOS and Android for now
      let startObject = {
        1: { 'send': 0, 'delivery': 0, 'open': 0 },
        3: { 'send': 0, 'delivery': 0, 'open': 0 }
      }

      res.response.rows.forEach((row) => {
        var count = parseInt(row['count'])
        // Don't care about rows that don't have values > 0, or rows that are not actions we want
        if (count > 0 && (row['action'] == 'send' || row['action'] == 'delivery' || row['action'] == 'open')) {
          startObject[row['platformid']][row['action']] += parseInt(row['count'])
        }
      })

      Vue.set(this, 'notificationPlatformStats', startObject)
    },
    showNotification (id) {
      return this.currentNotificationId == id
    },
    getDeviceImage (id) {
      let fileName = this.$globals.deviceImageMapping[id]
      if (!fileName) return // sometimes we may not have a mapping...
      return require(`../../assets/icons/${fileName}`)
    },
    displayMessageContent (notification) {
      return notification.content.en || notification.content.default
    }
  }
}
</script>

<style scoped lang="scss">

.list-push {

  .push-notifications {

    .no-messages {
      font-style:                   italic;
    }

    .notification-container {
      border:                       1px solid #dfe0e2;
      border-radius:                0.25em;
      margin-bottom:                0.88em;

      .header {
        display:                    flex;
        align-items:                center;
        cursor:                     pointer;
        background:                 #dfe0e2;
        padding:                    0.88em;

        .id {
          font-weight:              bold;
        }

        .message-content {
          margin-left:              3em;
          text-overflow:            ellipsis;
          overflow:                 hidden;
          white-space:              nowrap;
          max-width:                25em;
        }

        .send-date {
          margin-left:              auto;
        }
      }

      .body {

        padding:                    1.5em 2em;

        .message-details {

          .detail {

            display:                flex;

            > label {
              font-weight:          bold;
              width:                20%;
            }

            > span {
              width:                80%;
            }

            .device-image {
              width:                2em;
              margin-right:         0.25em;
            }

            &.status {

              .status-note {

                width:                auto;
                border-radius:        4px;

                &.done {
                  background-color:   #00b894;
                  padding:            0.15em 0.4em;
                  color:              white;
                }

                &.pending {
                  background-color:   #e67e22;
                  padding:            0.15em 0.4em;
                  color:              white;
                }

              }
            }

            &.platforms {
              cursor:                 pointer;
            }

            &.message-title {
              margin-top:             1em;
            }
          }
        }
      }
    }
  }

  .msg-stats-modal {

    h2 {
      background-color:               #dfe0e2;
      padding:                        0.25em;
      margin-top:                     1em;
      margin-bottom:                  0.25em;
      font-weight:                    bold;
    }

    .statistic {
      padding:                        0 0.5em;
    }
  }
}

</style>
