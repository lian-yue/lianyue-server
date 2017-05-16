<template>
<main>
  <section id="content">
    <div id="posts-index">
      <h1 class="title" v-if="$route.query.search && $route.query.search.trim()">搜索<strong>{{$route.query.search}}</strong>的结果</h1>
      <h1 class="title" v-else-if="postList.tag">标签<router-link :to="postList.tag.postUrl" :title="postList.tag.names[0]" rel="tag">{{postList.tag.names[0]}}</router-link>下的文章</h1>
      <h1 class="title" v-else-if="$route.query.isPage">页面列表</h1>
      <h1 class="title" v-else>{{siteTitle}}</h1>
      <article v-for="(post, key) in postList.results" :key="key" class="post entry hentry"  itemscope itemtype="http://schema.org/BlogPosting">
        <header class="entry-header">
          <h2 class="entry-title">
            <router-link :to="post.url" rel="bookmark" :title="post.title" itemprop="headline">{{post.title}}</router-link>
          </h2>
          <div class="entry-meta">
            <time class="entry-date" itemprop="datePublished" :datetime="post.createdAt | fromDate" :title="post.createdAt | fromDate">{{post.createdAt | fromNow}}</time>
            <span class="comments-link">
              <router-link :to="post.url + '#comments'" rel="nofollow">{{(post.meta.comments || 0) + '条评论'}}</router-link>
            </span>
          </div>
        </header>
        <markdown-view class="content entry-content" itemprop="articleBody" :html="true" :children="content(post)"></markdown-view>
      </article>
      <nav class="navigation pagination" role="navigation">
        <loading v-if="postList.loading"></loading>
        <a v-else-if="postList.more" :href="pageNext" class="more" @click="pageMore" rel="next">加载更多</a>
        <span v-else class="loaded">全部已加载完毕</span>
        <router-link v-if="$route.page > 1" :to="pagePrev" class="prev" rel="prev">上一页</router-link>
        <router-link v-if="postList.more" :to="pageNext" class="next" rel="next">下一页</router-link>
      </nav>
    </div>
  </section>
  <section id="links" v-if="$route.fullPath == '/'" v-html="linksExcerpt"></section>
  <section id="admin-menu" v-if="token.admin">
    <ul id="admin-menu-fixed" class="nav flex-column">
      <li class="nav-item">
        <router-link to="/" class="nav-link" v-if="$route.query.deleted">已发布</router-link>
        <router-link to="/?deleted=1" class="nav-link" v-else>回收站</router-link>
      </li>
      <li class="nav-item">
        <router-link to='/' class="nav-link" v-if="$route.query.isPage">文章列表</router-link>
        <router-link to="/?isPage=1" class="nav-link" v-else>页面列表</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/create" class="nav-link">创建文章</router-link>
      </li>
      <li class="nav-item" v-if="postList.tag && postList.tag.state != -1">
        <router-link :to="postList.tag.url + '/update'" class="nav-link">编辑标签</router-link>
      </li>
      <li class="nav-item" v-if="postList.tag">
        <a href="#" @click="onTagState" class="nav-link">{{postList.tag.state == -1 ? '启用标签' : '禁用标签'}}</a>
      </li>
      <li class="nav-item">
        <router-link to="/comments" class="nav-link">评论管理</router-link>
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

import pagination from '../../mixins/pagination'

import {LINKS, POST_LIST} from '../../store/types'

const toUrl = Vue.filter('toUrl')



export default {
  data() {
    return {
      siteTitle: site.title,
    }
  },

  mixins: [
    pagination
  ],

  watch: {
    $route() {
      this.fetchAuto()
    }
  },

  methods: {
    async fetch({state, dispatch, commit}) {
      var route = state.route
      var add = this.isMore
      if (this.isMore) {
        this.isMore = false
      }
      await dispatch({
        type: POST_LIST,
        add,
        path: route.path,
        query: route.query,
        fullPath: route.fullPath.split('#')[0],
      })

      if (this.isMore) {
        this.isMore = false
      }

      if (state.route.fullPath == '/' && !state.links.excerpt) {
        await dispatch({
          type: LINKS,
        })
      }
    },
    fetchAuto() {
      if (!__SERVER__ && this.$route.fullPath.split('#')[0] != this.postList.fullPath) {
        this.fetch(this.$store)
      }
    },
    content(post) {
      return post.excerpt + '<p><a href="'+ post.url +'" class="more-link">继续阅读 »</a></p>'
    },

    async onTagState(e) {
      e.preventDefault();
      var tag = this.postList.tag
      var state = tag.state == -1 ? 0 : -1
      const commit = this.$store.commit
      try {
        await commit.fetch(tag.url +'/state', {}, {state})
        commit({
          type: POST_LIST,
          add: true,
          state: {
            tag: {...tag, state}
          }
        })
      } catch (e) {
        e.name = 'popup'
        commit(e)
      }
    }
  },

  computed: {
    linksExcerpt() {
      if (!this.links.excerpt) {
        return ''
      }
      return '<h2 class="title">友情链接</h2>' + this.links.excerpt
    },
    ...mapState(['postList', 'links', 'token'])
  },

  mounted() {
    this.fetchAuto()
  },

  headers({state}) {
    var route = state.route
    var query = {}

    var search = route.query.search ? route.query.search.trim() : false
    var tag = state.postList.tag
    var page = parseInt(route.query.page || 1)
    if (isNaN(page)) {
      page = 1
    }

    var headers = {
      html: {
        prefix: 'og:http://ogp.me/ns/website#'
      },
      title: [],
      meta: [],
      link: [],
      breadcrumb: [],
    }

    if (search) {
      headers.title.push('搜索 '+ search +' 的结果')
      headers.meta.push({name:'robots', content: 'none'})

      headers.breadcrumb.push('搜索结果')
    } else if (route.query.isPage) {
      headers.title.push('页面列表')
      headers.meta.push({name:'robots', content: 'none'})

      headers.breadcrumb.push('页面列表')
    } else if (tag) {
      headers.title.push(tag.names[0])
      headers.meta.push({name: 'keywords', content: tag.names.join(',')})
      headers.meta.push({name: 'description', content: tag.description})
      headers.meta.push({property: 'og:description', content: tag.description})

      headers.breadcrumb.push(tag.names[0])
    } else {
      headers.meta.push({name: 'keywords', content: site.keywords.join(',')})
      headers.meta.push({name: 'description', content: site.description})
      headers.meta.push({property: 'og:description', content: site.description})

      headers.breadcrumb.push('文章列表')
    }

    if (page > 1) {
      query.page = page
      headers.title.push('第' + page + '页')
    }

    headers.title.push(site.title)
    if (headers.title.length == 1) {
      headers.title.push(site.description)
    }

    headers.meta.push({property: 'og:type', content: 'website'})
    headers.meta.push({property: 'og:title', content: headers.title.join(' - ')})


    headers.link.push({rel:'canonical', type: 'text/html', href: toUrl(route.path, query, state)})


    if (query.page > 1) {
      headers.link.push({rel:'prev', type: 'text/html', href: toUrl(route.path, Object.assign({}, query, {page:query.page == 2 ? undefined : query.page - 1}), state)})
    }

    if (state.postList.more) {
      headers.link.push({rel:'next', type: 'text/html', href: toUrl(route.path, Object.assign({}, query, {page:(query.page ? query.page + 1 : 2)}), state)})
    }

    headers.link.push({rel:'alternate', type: 'application/rss+xml', title: site.title + ' » Feed', href: toUrl(route.path, Object.assign({}, query, {view: 'rss', page: undefined}), state)})


    return headers
  },
}
</script>
