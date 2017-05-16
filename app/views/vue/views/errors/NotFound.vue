<template>
<main>
  <section id="content">
    <div id="not-found">
    </div>
  </section>
</main>
</template>

<style lang="sass">
$www: #111

.red
  color: red
.animate
  color: $www
  animation: fade 1s
</style>

<script>
import site from 'config/site'


import {MESSAGES} from '../../store/types'

export default {
  watch: {
    $route() {
      this.messageAuto()
    },
  },

  methods: {
    messageAuto() {
      if (__SERVER__) {
        return
      }
      this.$store.commit({
        type: MESSAGES,
        name: 'popup',
        message: '您请求的页面不存在'
      })
    }
  },

  mounted() {
    this.messageAuto()
  },


  headers({state}) {
    var title = '错误消息'
    return {
      status: 404,
      title: [title, site.title],
      meta: [
        {name: 'robots', content:'none'},
      ],
      breadcrumb: [title],
    }
  }
}
</script>
