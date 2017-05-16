<template>
<main>
  <section id="content">
    <div id="tags-index">
      <h1 class="title">标签</h1>
      <ul class="tags-list">
        <li v-for="(tag, key) in tagList.results" :key="key"><router-link :to="tag.postUrl" rel="tag" class="btn btn-outline-primary" :title="tag.names[0]">{{tag.names[0] + '('+ tag.count +')'}}</router-link></li>
      </ul>
      <nav class="navigation pagination" role="navigation">
        <loading v-if="tagList.loading"></loading>
        <a v-else-if="tagList.more" :href="pageNext" class="more" @click="pageMore" rel="next">加载更多</a>
        <span v-else class="loaded">全部已加载完毕</span>
        <router-link v-if="$route.page > 1" :to="pagePrev" class="prev" rel="prev">上一页</router-link>
        <router-link v-if="tagList.more" :to="pageNext" class="next" rel="next">下一页</router-link>
      </nav>
    </div>
  </section>
  <section id="admin-menu" v-if="token.admin">
    <ul id="admin-menu-fixed" class="nav flex-column">
      <li class="link-item">
        <router-link to="/tags" class="nav-link" v-if="$route.query.state == -1">已发布</router-link>
        <router-link to="/tags?state=-1" class="nav-link" v-else>已禁用</router-link>
      </li>
      <li  class="link-item"><router-link to="/tags/create" class="link-link">创建</router-link></li>
    </ul>
  </section>
</main>
</template>
<style lang="sass">
@import "../../styles/variables"
#tags-index
  .title
    display: none
  .tags-list
    @include clearfix()
    list-style: none
    padding: 0
    margin: 0
    li
      float: left
    a
      display: block
      float: left
      margin: 0 1rem 1rem 0
  .pagination
    border: 0
    .next,
    .prev,
      display: none
</style>
<script>
import Vue from 'vue'
import { mapState } from 'vuex'

import site from 'config/site'

import pagination from '../../mixins/pagination'

import {TAG_LIST} from '../../store/types'

const toUrl = Vue.filter('toUrl')

const title = '标签列表'

export default {
  data() {
    return {
      isMore: false,
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
        type: TAG_LIST,
        add,
        path: route.path,
        query: route.query,
        fullPath: route.fullPath.split('#')[0],
      })
    },


    fetchAuto() {
      if (!__SERVER__ && this.$route.fullPath.split('#')[0] != this.tagList.fullPath) {
        this.fetch(this.$store)
      }
    },
  },

  computed: {
    ...mapState(['tagList', 'token'])
  },

  mounted() {
    this.fetchAuto()
  },

  headers({state}) {
    var route = state.route
    var query = {}

    var headers = {
      html: {
        prefix: 'og:http://ogp.me/ns#',
      },
      title: [],
      meta: [],
      link: [],
      breadcrumb: [],
    }
    var query = {}

    var page = parseInt(route.query.page || 1)
    if (isNaN(page) || page < 1) {
      page = 1
    }
    var search = (route.query.search || '').trim()


    if (search) {
      query.search = search
      headers.title.push('搜索 '+ search +' 的结果')
    }


    if (page > 1) {
      query.page = page
      headers.title.push('第' + page + '页')
    }

    // 带有搜索
    if (search) {
      headers.meta.push({name:'robots', content: 'none'})
    }



    headers.link.push({rel:'canonical', type: 'text/html', href: toUrl(route.path, query, state)})


    if (query.page > 1) {
      headers.link.push({rel:'prev', type: 'text/html', href: toUrl(route.path, Object.assign({}, query, {page:query.page == 2 ? undefined : query.page - 1}), state)})
    }

    if (state.tagList.more) {
      headers.link.push({rel:'next', type: 'text/html', href: toUrl(route.path, Object.assign({}, query, {page:query.page + 1}), state)})
    }

    headers.title.push(title, site.title)

    headers.breadcrumb.push(title)

    return headers
  }
}
</script>
