<template>
<main>
  <comment-section />
  <section id="admin-menu" v-if="token.admin">
    <ul id="admin-menu-fixed" class="nav flex-column">
      <li class="nav-item">
        <router-link :to="$route.path" class="nav-link" v-if="$route.query.deleted">已发布</router-link>
        <router-link :to="$route.path + '?deleted=1'" class="nav-link" v-else>回收站</router-link>
      </li>
    </ul>
  </section>
</main>
</template>

<style lang="sass">

</style>
<script>
import { mapState } from 'vuex'

import CommentSection from './CommentSection'

import site from 'config/site'

export default {
  components: {
    CommentSection,
  },
  methods: {
    fetch(store) {
      return CommentSection.methods.fetch(store)
    },
  },
  computed: mapState(['commentList', 'token']),

  headers({state}) {
    var post = state.commentList.post

    var headers = {
      html: {},
      title: [],
      meta: [],
      link: [],
      breadcrumb: [],
    }

    if (!post._id) {
      headers.status = 404
      headers.statistics = false
      headers.title.push('文章评论', site.title)
      headers.breadcrumb.push('文章评论')
      headers.meta.push({name: 'robots', content:'none'})
      return headers
    }


    headers.title.push('文章评论', post.title, site.title)

    var postTitle = post.title
    if (postTitle) {
      headers.breadcrumb.push({
        url: post.url,
        name: postTitle.length > 16 ? postTitle.substr(0, 13) + '...' : postTitle.substr(0, 16)
      })
    }
    headers.breadcrumb.push('文章评论')


    return headers
  }
}
</script>
