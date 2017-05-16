<template>
<main>
  <section id="content">
    <form id="tags-editor" role="form" method="post" class="form-horizontal" @submit="onSubmit" autocomplete="off">
      <messages></messages>
      <div class="form-group row">
        <label class="form-label" for="names">标签名: </label>
        <input type="text" class="form-control" id="names" name="names" v-model="names" placeholder="" />
        <p class="form-text">多个标签请用英文逗号（<code>,</code>）分开</p>
      </div>
      <div class="form-group">
        <label for="content" class="form-label">内容: </label>
        <markdown-editor :rows="20" placeholder="" :storage="true" v-model="content" />
      </div>
      <div class="form-group">
        <label for="parents" class="form-label">父级: </label>
        <tags-input id="parents" name="parents" v-model="parents" />
      </div>
      <div class="form-group">
        <label for="sort" class="form-label">排序: </label>
        <input type="number" class="form-control" name="sort" id="sort" v-model="sort" />
      </div>
      <div class="form-group">
        <button type="submit" :disabled="submitting || tagRead.loading" class="btn btn-primary btn-lg btn-block">提交</button>
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

import {TAG_READ} from '../../store/types'


import MarkdownEditor from '../../components/markdown/Editor'
import TagsInput from '../../components/TagsInput'

export default {
  data() {
    return {
      submitting: false,
      names: '',
      content: '',
      parents: [],
      sort: 0,
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
      if (!route.params.tag) {
        return
      }
      await dispatch({
        type: TAG_READ,
        path: '/tags/' + route.params.tag,
        query: {update: true},
        fullPath: route.fullPath.split('#')[0],
      })
      this.setData()
    },

    fetchAuto() {
      if (__SERVER__) {
        return;
      }
      if (this.$route.fullPath.split('#')[0] == this.tagRead.fullPath) {
        this.setData()
      } else {
        this.fetch(this.$store)
      }
    },
    setData() {
      var tag = this.tagRead
      this.names = tag.names.join(',')
      this.content = tag.content
      this.parents = tag.parents,
      this.sort = tag.sort || 0
    },

    async onSubmit(e) {
      e.preventDefault()
      const commit = this.$store.commit
      var tag = this.$route.params.tag

      var body = {...this.$data}
      body.parents = body.parents.filter(tag => tag && tag.names.length).map(tag => tag.names[0])

      try {
        this.submitting = true
        var result = await commit.fetch('/tags/' + (tag ? tag : 'create'), {}, body)
        this.$router.push(result.postUrl + '?message=' + (tag ? 'update' : 'create') + '&r='+ Date.now())
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
    }
  },

  computed: {
    ...mapState(['tagRead'])
  },

  mounted() {
    this.fetchAuto()
  },

  headers({state}) {
    var title = state.route.params.tag ? '编辑标签' : '创建标签'
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
