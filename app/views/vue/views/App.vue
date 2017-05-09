<template>
<div id="app">
  <header id="header" role="banner">
    <div id="profile">
      <div id="logo">
        <router-link :title="title + ' - ' + description" rel="home" to="/">{{title}}</router-link>
      </div>
      <h1 class="site-name">
        <router-link :title="title + ' - ' + description" rel="home" to="/">{{title}}</router-link>
      </h1>
      <p class="site-description">{{description}}</p>
    </div>
    <div id="nav">
      <nav id="nav-bar" class="navbar" role="navigation">
        <ul>
          <li><router-link to="/" :class="$route.path == '/' ? 'active' : null" rel="home" title="网站首页"><i class="fa fa-home"></i><span>首页</span></router-link></li>
          <li><router-link to="/tags" :class="$route.path == '/tags' ? 'active' : null" title="分类标签"><i class="fa fa-tags"></i><span>标签</span></router-link></li>
          <li><router-link to="/about" :class="$route.path == '/about' ? 'active' : null" title="关于恋月"><i class="fa fa-user"></i><span>关于</span></router-link></li>
          <li><router-link to="/links" :class="$route.path == '/links' ? 'active' : null" title="友情链接"><i class="fa fa-link"></i><span>友链</span></router-link></li>
        </ul>
      </nav>
      <nav id="nav-icon" class="nav-icon" role="navigation">
        <ul>
          <li><a :href="github" title="访问 GitHub" target="_blank" rel="nofollow"><i class="fa fa-lg fa-github"></i><span>GitHub</span></a></li>
          <li><a :href="email" title="联系 E-Mail" target="_blank"  rel="nofollow"><i class="fa fa-lg fa-envelope"></i><span>联系 E-Mail</span></a></li>
          <li><a :href="feed" title="Feed 订阅" target="_blank"  rel="nofollow"><i class="fa fa-lg fa-feed"></i><span>邮箱订阅</span></a></li>
        </ul>
      </nav>
    </div>
  </header>
  <div id="container">
    <div id="breadcrumb-bar">
      <div id="header-toggle">
        <button type="button" class="btn btn-header-toggle" @click="onHeaderShow">
          <i class="fa fa-bars fa-lg"></i><span>菜单</span>
        </button>
      </div>
      <ol class="breadcrumb" id="breadcrumb" itemprop="breadcrumb">
        <li>
          <router-link rel="home" to="/">
            <i class="fa fa-home"></i>首页
          </router-link>
        </li>
        <li v-if="headers.breadcrumb" v-for="value, key in headers.breadcrumb" :key="key" :class="(key + 1) == headers.breadcrumb.length ? 'active' : ''">
          <router-link v-if="value && typeof value == 'object'" :to="value.url">{{value.name}}</router-link>
          <span v-else>{{value}}</span>
        </li>
      </ol>
      <form id="search-form" method="get" action="/" @submit="onSearch">
        <label for="search">
          <i class="fa fa-search fa-lg"></i>
          <span>搜索:</span>
        </label>
        <input type="search" id="search" ref="search" class="form-control" name="search" placeholder="请输入关键字" required="">
        <button type="submit" class="btn btn-primary">搜索</button>
      </form>
    </div>
    <router-view id="main" role="main"></router-view>
  </div>
  <footer id="footer" role="contentinfo">
    <div class="info">
      <span class="copyright">Copyright&nbsp;&#169;&nbsp;2009-2016&nbsp;<a :href="url">{{title}}</a>&nbsp;All Rights Reserved!</span>
      <span class="powered">Powered by Koa &amp; <a href="//www.lianyue.org" target="_blank">Lian Yue</a></span>
    </div>
  </footer>
  <div id="header-backdrop" @click="onHeaderHide"></div>
  <messages-popup />
</div>
</template>

<style lang="sass">
@import "../styles/app"
</style>
<script>
import { mapState } from 'vuex'

import site from 'config/site'
import { MESSAGES_CLOSE } from '../store/types'

const MessagesPopup = {
  methods: {
    onClose(e) {
      if (this.timrer) {
        clearTimeout(this.timrer)
        this.timrer = null
      }
      e && e.preventDefault()
      this.$store.commit({type: MESSAGES_CLOSE, name: 'popup'})
    }
  },
  computed: mapState(['messages', 'route']),
  watch: {
    messages() {
      if (__SERVER__) {
        return
      }
      var popup = this.messages.popup
      if (popup && !popup.close) {
        if (this.timrer) {
          clearTimeout(this.timrer)
        }
        this.timrer = setTimeout(() => {
          this.onClose()
        }, 3000)
      }
    },
    $route() {
      if (!__SERVER__) {
        this.onClose()
      }
    },
  },
  render (h) {
    return h(
      'div',
      {
        attrs: {
          id: 'messages-popup'
        },
        on: {
          dblclick: this.onClose
        },
      },
      [
        h(
          'messages',
          {
            props: {
              name: 'popup',
            },
          }
        )
      ]
    )
  }
}


export default {
  components: {
    MessagesPopup
  },
  watch:{
    $route() {
      if (!__SERVER__) {
        this.$nextTick(() => {
          this.onHeaderHide()
        })
      }
    },

  },

  computed: mapState(['headers']),

  methods: {
    onHeaderShow(e) {
      e.preventDefault()
      document.body.className = document.body.className.replace(/\s*header-open\s*/, '') + ' header-open'
    },

    onHeaderHide(e) {
      e && e.preventDefault()
      document.body.className = document.body.className.replace(/\s*header-open\s*/, '')
    },

    onSearch(e) {
      e.preventDefault()
      this.$router.push('/?search=' + encodeURIComponent(this.$refs.search.value || ''))
      this.$refs.search.blur()
    },

    onResize() {
      const html = document.documentElement
      const footer = document.getElementById('footer')
      const container = document.getElementById('container')
      var marginTop = html.offsetTop
      const minHeight = document.documentElement.clientHeight - footer.offsetHeight - marginTop - 10
      container.style.minHeight = minHeight + 'px'
    },

  },

  data() {
    return Object.assign({
      github: '#',
      email: '#',
      feed: '#',
    }, site)
  },

  mounted() {
    this.github = '//github.com/lian-yue'
    this.email = 'mailto:' + site.email
    this.feed = '/?view=json'
    window.addEventListener('resize', this.onResize)

    this.onResize()
  },
}
</script>
