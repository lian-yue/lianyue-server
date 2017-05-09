import queryString from 'query-string'




const mixin = {
  computed: {
    $pagePrev() {
      var page = this.$route.query.page || 1
      page--
      if (page <= 1) {
        page = undefined
      }
      var query = queryString.stringify(Object.assign({}, this.$route.query, {page}))
      return this.$route.path + (query ? '?' + query : '')
    },
    $pageNext() {
      var page = this.$route.query.page || 1
      page++
      return this.$route.path + '?' + queryString.stringify(Object.assign({}, this.$route.query, {page}))
    },
  },

  methods: {
    $pageMore(e) {
      e && e.preventDefault();
      this.isMore = true
      var scrollBehavior = this.$router.options.scrollBehavior
      this.$router.options.scrollBehavior = false
      this.$router.push(this.$pageNext, () => {
        this.$router.options.scrollBehavior = scrollBehavior
      })
    }
  },
}

export default {
  install(Vue, options) {
    if (Vue.pagination) {
      return
    }
    Vue.pagination = true
    Vue.mixin(mixin)
  }
}
