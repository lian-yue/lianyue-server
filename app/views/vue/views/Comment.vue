<template>
<main>
  <section id="comments">
    <ol id="comments-list">
      <li v-for="(comment, key) in commentList.results" :key="key"  :class="comment.admin ?  'comment-admin' : null">
        <header class="comment-meta">
          <div class="comment-author"><img :src="comment.avatar" class="avatar photo" /></div>
          <div class="actions">
            <a class="restore" href="#" v-if="token.admin && comment.deletedAt" rel="nofollow" @click.prevent="onRestore(comment)">恢复</a>
            <a class="delete" href="#" v-else-if="token.admin" rel="nofollow" @click.prevent="onDelete(comment)">删除</a>
            <a class="reply" href="#" rel="nofollow" v-if="comment.post && comment.post.comment" @click.prevent="onReply(comment)">回复</a>
          </div>
          <div class="text">
            <span class="author vcard">{{comment.author}}</span>
            <span class="title" v-if="comment.post && comment.post._id">在 <router-link :to="comment.post.url" :title="comment.post.title">{{comment.post.title.length > 16 ? comment.post.title.substr(0, 13) + '...' : comment.post.title}}</router-link></span>
            <span class="says" v-if="comment.parent">对 <strong>{{comment.parent.author}}</strong> 说</span>
            <span class="says" v-else>说</span>
            <span class="time"><time :datetime="comment.createdAt | fromDate" :title="comment.createdAt | fromDate">{{comment.createdAt | fromNow}}</time></span>
          </div>
        </header>
        <markdown-view class="content comment-content" :html="true" :children="comment.htmlContent"></markdown-view>
        <form role="form" method="post" id="comments-form" @submit="onSubmit" v-if="parent && parent._id == comment._id">
          <messages />
          <div class="form-group">
            <label for="author">名称：</label>
            <input id="author" name="author" class="form-control" placeholder="在此输入你的姓名" type="text" v-model="author" maxLength="32" required />
          </div>
          <div class="form-group">
            <label for="email">电子邮件：</label>
            <input id="email" name="email" class="form-control" type="email"  placeholder="请输入你的电子邮箱" v-model="email" maxLength="64" required />
          </div>
          <div class="form-group">
            <label for="comment-content">评论内容：</label>
            <span class="reply-info" v-if="parent">您正在回复 <strong>{{parent.author}}</strong> 的评论 <a rel="nofollow" class="cancel-reply" href="#" @click.prevent="onReply(null)">点击这里取消回复。</a></span>
            <textarea id="comment-content" name="content" class="form-control"  ref="content" v-model="content" maxLength="8192" required></textarea>
            <p>支持 <code>MarkDown</code> 代码, <code>Html</code> 标签</p>
          </div>
          <div class="form-group">
            <button type="submit" :disabled="submitting || commentList.loading" class="btn btn-primary btn-lg btn-block">提交</button>
          </div>
        </form>
      </li>
    </ol>
    <nav class="navigation pagination" role="navigation" v-if="commentList.more">
      <loading v-if="commentList.loading" />
      <a v-else :href="pageNext" class="more" @click="pageMore" rel="next">加载更多</a>
    </nav>
  </section>
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
@import "../styles/comments"
</style>
<script>
import { mapState } from 'vuex'

import site from 'config/site'
import pagination from '../mixins/pagination'

import {COMMENT_LIST} from '../store/types'

export default {

  data() {
    return {
      parent: null,
      submitting: false,
      email: '',
      author: '',
      content: '',
    }
  },


  computed: {
    pageNextQuery() {
      var id = undefined
      var comments = this.commentList.results
      if (comments.length) {
        id = comments[comments.length - 1]._id
      }
      return {id}
    },
    ...mapState(['commentList', 'token'])
  },


  mixins: [
    pagination
  ],

  watch: {
    author() {
      if (this.author != localStorage.getItem('author')) {
        localStorage.setItem('author', this.author)
      }
    },
    email() {
      if (this.email != localStorage.getItem('email')) {
        localStorage.setItem('email', this.email)
      }
    },
    $route() {
      this.fetchAuto()
    },
  },

  methods: {
    async fetch({state, dispatch, commit}) {
      if (__SERVER__) {
        return
      }

      var route = state.route
      var add = this.isMore
      if (this.isMore) {
        this.isMore = false
      }

      await dispatch({
        type: COMMENT_LIST,
        add,
        path: '/comments',
        query: route.query,
        fullPath: route.fullPath.split('#')[0],
      })

      if (this.isMore) {
        this.isMore = false
      }
    },


    fetchAuto() {
      if (!__SERVER__ && this.$route.fullPath.split('#')[0] != this.commentList.fullPath) {
        this.fetch(this.$store)
      }
    },

    async onDelete(comment) {
      const commit = this.$store.commit
      try {
        await commit.fetch('/' + comment.post._id + '/comments/' + comment._id +'/' + (commit.deletedAt ? 'restore' : 'delete'), {}, {})
        var state = {...this.commentList}
        state.results = [].concat(state.results)
        state.results.splice(state.results.indexOf(comment), 1)
        commit({
          type: COMMENT_LIST,
          state,
        })
      } catch (e) {
        e.name = 'popup'
        commit(e)
      }
    },

    onRestore(comment) {
      return this.onDelete(comment)
    },

    onReply(parent) {
      this.parent = parent
      if (parent) {
        this.$nextTick(() => {
          this.$refs.content[0].focus()
        })
      }
    },

    async onSubmit(e) {
      e.preventDefault()

      const commit = this.$store.commit
      try {
        this.submitting = true
        var body = {...this.$data}
        body.parent = body.parent._id

        var comment = await commit.fetch('/' + this.parent.post._id + '/comments/create', {}, body)
        this.content = ''

        commit({
          type: COMMENT_LIST,
          add: true,
          state: {
            results: [comment],
          },
        })
        this.content = ''
        this.onReply(null)
      } catch (e) {
        commit(e)
      } finally {
        this.submitting = false
      }
    },
  },

  mounted() {
    this.fetchAuto()

    var email = localStorage.getItem('email')
    if (email) {
      this.email = email
    }
    var author = localStorage.getItem('author')
    if (author) {
      this.author = author
    }
  },

  headers({state}) {
    var title = '评论管理'
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
