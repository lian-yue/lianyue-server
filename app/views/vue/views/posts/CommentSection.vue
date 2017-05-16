<template>
<section id="comments">
  <ol id="comments-list">
    <li v-for="(comment, key) in commentList.results" :key="key"  :class="comment.admin ?  'comment-admin' : null">
      <header class="comment-meta">
        <div class="comment-author"><img :src="comment.avatar" class="avatar photo" /></div>
        <div class="actions">
          <a class="restore" href="#" v-if="token.admin && comment.deletedAt" rel="nofollow" @click.prevent="onRestore(comment)">恢复</a>
          <a class="delete" href="#" v-else-if="token.admin" rel="nofollow" @click.prevent="onDelete(comment)">删除</a>
          <a class="reply" href="#" rel="nofollow" v-if="commentList.post.comment" @click.prevent="onReply(comment)">回复</a>
        </div>
        <div class="text">
          <span class="author vcard">{{comment.author}}</span>
          <span class="says" v-if="comment.parent">对 <strong>{{comment.parent.author}}</strong> 说</span>
          <span class="says" v-else>说</span>
          <span class="time"><time :datetime="comment.createdAt | fromDate" :title="comment.createdAt | fromDate">{{comment.createdAt | fromNow}}</time></span>
        </div>
      </header>
      <markdown-view class="content comment-content" :html="true" :children="comment.htmlContent"></markdown-view>
    </li>
  </ol>
  <nav class="navigation pagination" role="navigation" v-if="commentList.more">
    <loading v-if="commentList.loading" />
    <router-link v-else-if="$route.path.indexOf('/comments') == -1" :to="'/' + $route.params.slug + '/comments'" class="more" rel="next">查看全部评论</router-link>
    <a v-else :href="pageNext" class="more" @click="pageMore" rel="next">加载更多</a>
  </nav>
  <form role="form" method="post" id="comments-form" @submit="onSubmit" v-if="commentList.post.comment">
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
</section>
</template>

<style lang="sass">
@import "../../styles/comments"
</style>
<script>
import { mapState } from 'vuex'

import site from 'config/site'

import pagination from '../../mixins/pagination'
import {COMMENT_LIST} from '../../store/types'

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

  mixins: [
    pagination
  ],


  watch: {
    $route() {
      this.fetchAuto()
    },
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
    content() {
      if (this.content != localStorage.getItem('comment-' + (this.$route.params.slug || ''))) {
        if (this.content) {
          localStorage.setItem('comment-' + this.$route.params.slug, this.content)
        } else {
          localStorage.removeItem('comment-' + this.$route.params.slug)
        }
      }
    },
  },

  computed: {
    pageNextQuery() {
      var index = undefined
      var comments = this.commentList.results
      if (comments.length) {
        index = comments[comments.length - 1].index
      }
      return {index}
    },
    ...mapState(['commentList', 'token'])
  },

  methods: {
    async fetch({state, dispatch, commit}) {
      var route = state.route
      var add = this.isMore
      if (this.isMore) {
        this.isMore = false
      }

      await dispatch({
        type: COMMENT_LIST,
        add,
        path: '/' + route.params.slug + '/comments',
        query: route.path.indexOf('/comments') == -1 ? {} : route.query,
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
        await commit.fetch('/' + this.$route.params.slug + '/comments/' + comment._id +'/' + (comment.deletedAt ? 'restore' : 'delete'), {}, {})
        var state = {...this.commentList}
        state.results = [].concat(state.results)
        state.results.splice(state.results.indexOf(comment), 1)
        commit({
          type: COMMENT_LIST,
          state,
        })
      } catch (e) {
        commit(e)
      }
    },

    onRestore(comment) {
      return this.onDelete(comment)
    },

    onReply(parent) {
      this.parent = parent
      this.$refs.content.focus()
    },

    async onSubmit(e) {
      e.preventDefault()

      const commit = this.$store.commit
      try {
        this.submitting = true
        var body = {...this.$data}
        if (body.parent) {
          body.parent = body.parent._id
        } else {
          delete body.parent
        }
        var comment = await commit.fetch('/' + this.$route.params.slug + '/comments/create', {}, body)
        this.content = ''

        commit({
          type: COMMENT_LIST,
          add: true,
          state: {
            results: [comment],
          },
        })
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
    var content = localStorage.getItem('comment-' + (this.$route.params.slug || ''))
    if (content) {
      this.content = content
    }
  },
}

</script>
