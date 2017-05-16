<template>
<main>
  <section id="content">
    <form id="posts-editor" role="form" method="post" class="form-horizontal" @submit="onSubmit" autocomplete="off">
      <messages/>
      <div class="form-group">
        <label for="title" class="form-label">标题: </label>
        <input type="text" class="form-control" name="title" v-model="title" id="title" placeholder="在此输入标题"  maxlength="64" required />
      </div>
      <div class="form-group">
        <label for="slug"  class="form-label">自定义地址: </label>
        <input type="text" class="form-control"  name="slug" minlength="3" maxlength="32" pattern="^[0-9a-z_-]{3,32}$"  id="slug" placeholder="只允许只用小写英文数字和下划线" v-model="slug" />
      </div>
      <div class="form-group">
        <label for="content" class="form-label">内容: </label>
        <markdown-editor :rows="20" placeholder="" :storage="true" v-model="content" />
      </div>
      <div class="form-group">
        <label for="tags" class="form-label">标签: </label>
        <tags-input id="tags" v-model="tags" />
      </div>

      <div class="form-group">
        <label for="page" class="form-label">文章类型: </label>
        <select name="page" id="page" class="form-control" v-model="page">
          <option value="">文章</option>
          <option value="1">页面</option>
        </select>
      </div>

      <div class="form-group">
        <label for="comment" class="form-label">评论: </label>
        <select name="comment" id="comment" class="form-control" v-model="comment">
          <option value="1">允许评论</option>
          <option value="">禁止评论</option>
        </select>
      </div>

      <div class="form-group">
        <button type="submit" :disabled="submitting || postRead.loading" class="btn btn-primary btn-lg btn-block">提交</button>
      </div>
    </form>
  </section>
</main>
</template>

<style>
</style>

<script>
import { mapState } from 'vuex'

import site from 'config/site'


import {POST_READ} from '../../store/types'
import MarkdownEditor from '../../components/markdown/Editor'
import TagsInput from '../../components/TagsInput'

export default {

  data() {
    return {
      title: '',
      slug: '',
      content: '',
      tags: [],
      page: '',
      comment: '1',
      submitting: false,
    }
  },

  components: {
    MarkdownEditor,
    TagsInput,
  },

  methods: {
    async fetch({state, dispatch, commit}) {
      if (__SERVER__) {
        return
      }
      var route = state.route
      if (!route.params.slug) {
        return
      }
      await dispatch({
        type: POST_READ,
        path: '/' + route.params.slug,
        query: {update: true},
        fullPath: route.fullPath.split('#')[0],
      })
      this.setData()
    },
    fetchAuto() {
      if (__SERVER__) {
        return;
      }
      if (this.$route.fullPath.split('#')[0] == this.postRead.fullPath) {
        this.setData()
      } else {
        this.fetch(this.$store)
      }
    },
    setData() {
      var post = this.postRead
      this.title = post.title
      this.slug = post.slug
      this.content = post.content
      this.tags = post.tags.filter(tag => tag && tag.names.length)
      this.page = post.page ? '1' : ''
      this.comment = post.comment ? '1' : ''
    },
    async onSubmit(e) {
      e.preventDefault()
      const commit = this.$store.commit
      var slug = this.$route.params.slug

      var body = {...this.$data}
      body.tags = body.tags
        .filter(tag => !!tag)
        .map(tag => tag.names[0])

      try {
        this.submitting = true
        var result = await commit.fetch('/' + (slug ? slug : 'create'), {}, body)
        this.$router.push(result.url + '?message=' + (slug ? 'update' : 'create') + '&r='+ Date.now())
      } catch (e) {
        commit(e)
      } finally {
        this.submitting = false
      }
    }
  },

  watch: {
    $route() {
      this.fetchAuto()
    },
  },

  computed: {
    ...mapState(['postRead'])
  },

  mounted() {
    this.fetchAuto()
  },

  headers({state}) {
    var title = state.route.params.slug ? '编辑文章' : '创建文章'
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
