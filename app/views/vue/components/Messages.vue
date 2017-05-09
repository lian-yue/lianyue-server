<template>
<div role="alert" :class="['alert', 'alert-' + type, 'messages']" v-show="messages.length && !close">
    <button type="button" class="close" @click="onClose"><span>×</span></button>
    <p v-for="(message, key) in messages" :key="key">{{typeof message == 'string' ? message : message.message}}</p>
</div>
</template>
<script>
import { MESSAGES_CLOSE } from '../store/types'
export default {
  props: {
    name: {
      type: String,
      default: '',
    },
  },
  computed: {
    data() {
      return this.$store.state.messages[this.name] || {}
    },
    messages() {
      return this.data.messages || []
    },
    type() {
      var type = this.data.type
      if (!type || type == 'error') {
        type = 'danger'
      }
      return type
    },
    close() {
      return this.data.close
    },
  },
  methods: {
    onClose(e) {
      e.preventDefault()
      this.$store.commit({type: MESSAGES_CLOSE, name: this.name})
    }
  },
}
</script>
