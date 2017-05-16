import queryString from 'query-string'

export default {
  computed: {
    pagePrev() {
      var query = this.pagePrevQuery

      if (!query) {
        var page = this.$route.query.page || 1
        page--
        if (page <= 1) {
          page = undefined
        }
        query = {page}
      }
      var query = queryString.stringify(Object.assign({}, this.$route.query, query))
      return this.$route.path + (query ? '?' + query : '')
    },

    pageNext() {
      var query = this.pageNextQuery
      if (!query) {
        var page = this.$route.query.page || 1
        page++
        query = {page}
      }
      return this.$route.path + '?' + queryString.stringify(Object.assign({}, this.$route.query, query))
    },
  },

  methods: {
    pageMore(e) {
      e && e.preventDefault();
      this.isMore = true
      var scrollBehavior = this.$router.options.scrollBehavior
      this.$router.options.scrollBehavior = false
      this.$router.push(this.pageNext, () => {
        this.$router.options.scrollBehavior = scrollBehavior
      })
    }
  },
}
