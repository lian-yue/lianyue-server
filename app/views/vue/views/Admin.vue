<template>
<main>
  <section id="content">
    <div id="admin">
      <messages/>
      <form role="form" method="post" @submit="onSubmit">
        <div class="form-group">
          <label for="password" class="form-label">密码:</label>
          <input name="password" class="form-control" type="password" required v-model="password" maxLength="32" placeholder="请输入密码" id="password" ref="password" />
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="submitting">登陆</button>
        </div>
      </form>
    </div>
  </section>
</main>
</template>
<style lang="sass">
#admin
  max-width: 500px
  margin: 2rem auto 0 auto
</style>
<script>
import { mapState } from 'vuex'
import site from 'config/site'

import {TOKEN} from '../store/types'


export default {

  data() {
    return {
      password: '',
      submitting: false,
    }
  },

  methods: {
    async onSubmit(e) {
      e.preventDefault()
      const commit = this.$store.commit

      var body = {...this.$data}
      try {
        this.submitting = true
        var token = await commit.fetch('/admin', {}, body)
        commit({
          type: TOKEN,
          token,
        })
        this.$router.push(this.redirect_uri)
      } catch (e) {
        commit(e)
      } finally {
        this.submitting = false
      }
    },
  },

  mounted() {
    if (this.token.admin) {
      this.$router.push(this.redirect_uri)
    }
  },

  computed: {
    redirect_uri() {
      return this.$route.query.redirect_uri || '/'
    },
    ...mapState(['token'])
  },

  headers({state}) {
    var title = '管理员登陆'
    return {
      title: [title, site.title],
      meta: [
        {name: 'robots', content:'none'},
      ],
      breadcrumb: [title],
    }
  }
}
</script>
