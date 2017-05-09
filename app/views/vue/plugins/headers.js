import {HEADERS} from '../store/types'

const mixin = {
  created() {
    this.$headers()
  },
  beforeUpdate() {
    this.$headers()
  },
  activated() {
    this.$headers()
  },
}

function headers() {
  if (__SERVER__ || !this.$options.headers) {
    return
  }
  var headers = this.$options.headers(this.$store)
  headers.type = HEADERS
  if (JSON.stringify(headers) != JSON.stringify(this.$store.state.headers)) {
    this.$store.commit(headers)
  }
}

export default {
  install(Vue, options) {
    if (Vue.prototype.$headers) {
      return
    }
    Vue.prototype.$headers = headers
    Vue.mixin(mixin)
  }
}
