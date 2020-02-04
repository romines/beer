<template>
  <div class="list-push">
    <h2 class="subtitle">Push History</h2>

    <div class="push-notifications">
      <LoadingSpinner v-if="isLoadingPushes" isBlack="true"></LoadingSpinner>
      <div v-else v-for="notification in pushNotifications" class="notification-container">
        <div class="header" @click="showNotificationDetails(notification.id)">
          <span class="id">{{notification.id}}</span>
          <span class="message-content">{{notification.content.en}}</span>
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
            <div class="detail status">
              <label>Status:</label><span class="status">{{currentNotification.status}}</span>
            </div>
            <div class="detail platforms">
              <label>Platforms:</label><span class="platforms">
                <img v-for="platformId in currentNotification.platforms" v-bind:src="getDeviceImage(platformId)" class="device-image">
              </span>
            </div>
            <div class="detail message-content">
              <label>Message:</label><span class="message-content">{{currentNotification.content.en}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

import LoadingSpinner from '../utilities/LoadingSpinner.vue'
import moment from 'moment'

export default {
  components: {
    LoadingSpinner
  },
  data() {
    return {
      isLoadingPushes:            true,
      isLoadingNotification:      true,
      pushNotifications:          [],
      currentNotificationId:      null,
      currentNotification:        {}
    }
  },
  created() {
    this.getPushNotifications()
  },
  methods: {
    getPushNotifications () {
      this.isLoadingPushes = true
      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/getPushNotifications'

      this.axios.get(baseUrl).then((response) => {
        let body = JSON.parse(response.data.body)

        body.response.rows.map((notification) => {
          notification.sendDate = moment(notification.sendDate).format('lll')
        })
        this.pushNotifications  = body.response.rows
        this.isLoadingPushes    = false
      })

    },
    showNotificationDetails (id) {
      if (this.currentNotificationId == id) this.currentNotificationId = null
      else this.currentNotificationId = id

      this.isLoadingNotification = true

      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/getPushNotification'

      this.axios.get(baseUrl + "?messageId=" + id).then((response) => {
        let body            = JSON.parse(response.data.body)
        let messageDetails  = body.response.message

        messageDetails.platforms  = JSON.parse(messageDetails.platforms)
        messageDetails.created    = moment(messageDetails.created).format('lll')
        messageDetails.sendDate   = moment(messageDetails.send_date).format('lll')

        this.currentNotification    = messageDetails
        this.isLoadingNotification  = false
      })
    },
    showNotification (id) {
      return this.currentNotificationId == id
    },
    getDeviceImage (id) {
      let fileName = this.$globals.deviceImageMapping[id]
      // let string = '../../assets/icons/bb.svg'
      return require(`../../assets/icons/${fileName}`)
    }
  },
}
</script>

<style scoped lang="scss">

.list-push {

  .push-notifications {

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
            }
          }
        }
      }
    }
  }
}

</style>
