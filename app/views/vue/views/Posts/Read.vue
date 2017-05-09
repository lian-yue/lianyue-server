<template>
<main>
  <section id="content" v-if="postRead.loading">
    <loading size="xl" :middle="true"></loading>
  </section>
  <section id="content" v-else-if="!postRead._id">
  </section>
  <section id="content" v-else>
    <div id="posts-read">
      <article class="markdown entry hentry" itemscope itemtype="http://schema.org/BlogPosting">
        <header class="entry-header">
          <h1 class="entry-title">
            <router-link :to="postRead.url" rel="bookmark" title="postRead.title" itemprop="headline">{{postRead.title}}</router-link>
          </h1>
          <div class="entry-meta">
            <time class="entry-date" itemprop="datePublished" v-if="postRead.createdAt" :datetime="postRead.createdAt | fromDate" :title="postRead.createdAt | fromDate">{{postRead.createdAt | fromNow}}</time>
            <span class="entry-views">
              {{(postRead.meta.views || 0) + '次浏览'}}
            </span>
            <span class="comments-link">
              <router-link :to="postRead.url + '#comments'" rel="nofollow">{{(postRead.meta.comments || 0) + '条评论'}}</router-link>
            </span>
          </div>
        </header>
        <markdown-view class="content entry-content" itemprop="articleBody" :html="true" :children="postRead.htmlContent"></markdown-view>
        <footer class="entry-footer" v-if="postRead._id  && !postRead.page">
          <p>原文链接：<router-link :to="postRead.url">{{postRead.url | toUrl({}, this.$store.state)}}</router-link></p>
          <p>发表时间：<time class="entry-date" itemprop="datePublished" :datetime="postRead.createdAt | fromDate" :title="postRead.createdAt | fromDate">{{postRead.createdAt | fromDate('YYYY-MM-DD hh:mm:ss')}}</time></p>
          <p class="tag-links" v-if="postRead.tags.length">
            分类标签：<span itemprop="keywords">
              <router-link v-for="(tag, key) in postRead.tags" :key="key"  :to="tag.postUrl" rel="tag">{{tag.names[0]}}</router-link>
            </span>
          </p>
        </footer>
      </article>
      <nav class="pagination posts-pagination" v-if="postRead.prev || postRead.next">
        <router-link :to="postRead.prev.url" v-if="postRead.prev" class="prev" rel="prev">{{postRead.prev.title}}</router-link>
        <router-link :to="postRead.next.url" v-if="postRead.next" class="next" rel="next">{{postRead.next.title}}</router-link>
      </nav>
    </div>
  </section>
  <section id="admin-menu" v-if="token.admin && postRead._id">
    <ul id="admin-menu-fixed" class="nav flex-column">
      <li class="nav-item">
        <router-link :to="postRead.url + '/update'" class="nav-link">编辑</router-link>
      </li>
      <li class="nav-item">
        <a href="#" @click="onRestore" class="nav-link" v-if="postRead.deletedAt">恢复</a>
        <a href="#" @click="onDelete" class="nav-link" v-else>删除</a>
      </li>
    </ul>
  </section>
</main>
</template>
<style lang="sass">
@import "../../styles/posts"
</style>
<script>
import Vue from 'vue'
import { mapState } from 'vuex'

import site from 'config/site'

import {POST_READ, MESSAGES} from '../../store/types'

const toUrl = Vue.filter('toUrl')
const fromDate = Vue.filter('fromDate')



export default {
  watch: {
    $route() {
      this.fetchAuto()
    }
  },

  methods: {
    async fetch({state, dispatch, commit}) {
      var route = state.route

      await dispatch({
        type: POST_READ,
        path: route.path,
        query: route.query,
        fullPath: route.fullPath.split('#')[0],
      })
    },

    fetchAuto() {
      if (!__SERVER__ && this.$route.fullPath.split('#')[0] != this.postRead.fullPath) {
        this.fetch(this.$store)
      }
    },
    onDelete(e) {
      this.onRestore(e)
    },
    async onRestore(e) {
      var post = this.postRead
      const commit = this.$store.commit
      try {
        await commit.fetch(post.url +'/' + (post.deletedAt ? 'restore' : 'delete'), {}, {})
        await commit({
          type: POST_READ,
          add: true,
          state: {
            deletedAt: post.deletedAt ? null : new Date
          }
        })
      } catch (e) {
        commit({
          ...e,
          name: 'popup',
          type: MESSAGES,
          message: e.message
        })
      }
    }
  },


  computed: {
    ...mapState(['postRead', 'token'])
  },

  mounted() {
    this.fetchAuto()
  },
  headers({state}) {
    var post = state.postRead

    var headers = {
      html: {
        prefix: 'og:http://ogp.me/ns/article#'
      },
      title: [],
      meta: [],
      link: [],
      breadcrumb: [],
    }
    if (!post._id) {
      headers.status = 404
      headers.statistics = false
      headers.breadcrumb.push('文章内容')
      return headers
    }
    headers.title.push(post.title, site.title)

    var keywords = post.tags.filter(tag => !!tag).map(tag => tag.names[0])

    headers.meta.push(
      {name:'description', content: post.description},
      {name:'keywords', content: keywords.join(',')}
    )

    headers.meta.push(
      {property:'og:type', content: 'article'},
      {property:'og:title', content: post.title},
      {property:'og:description', content: post.description}
    )

    if (post.images.length) {
      headers.meta.push({property:'og:image', content: post.images[0]})
    }

    headers.meta.push({property:'article:author', content: '恋月 @' + site.author})
    headers.meta.push({property:'article:tag', content: keywords.join(',')})
    headers.meta.push({property:'article:published_time', content: fromDate(post.createdAt)})
    headers.meta.push({property:'article:modified_time', content: fromDate(post.updatedAt)})


    headers.link.push({
      rel: 'canonical',
      type: "text/html",
      href: toUrl(post.url, null, state),
    })

    if (post.prev) {
      headers.link.push({
        rel: 'prev',
        type: "text/html",
        title: post.prev.title,
        href: toUrl(post.prev.url, null, state),
      })
    }

    if (post.next) {
      headers.link.push({
        rel: 'next',
        type: "text/html",
        title: post.next.title,
        href: toUrl(post.next.url, null, state),
      })
    }

    if (post.page) {
      headers.breadcrumb.push(post.title)
    } else {
      if (post.tags.length && post.tags[0]) {
        var tag = post.tags[0]
        headers.breadcrumb.push({url: tag.postUrl, name: tag.names[0]})
      }
      headers.breadcrumb.push('文章内容')
    }

    return headers
  }
}




</script>
