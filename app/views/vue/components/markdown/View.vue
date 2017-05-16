<template>
<div :class="['markdown-content', this.invisible && this.html ? 'invisible' : '']" v-html="vhtml">
</div>
</template>
<style lang="sass">
@import "../../styles/variables"
@import "~bootstrap/scss/tables"
@import "~highlight.js/styles/atom-one-light.css"
.markdown-content
  .toc:first-child
    @include border-radius($border-radius)
    float: right
    background: $body-bg
    padding: 1rem 1.2rem 1rem 2.4rem
    margin-left: 1.4rem
    margin-bottom: 1.5rem
    border:  1px solid $border-color
  .footnote
    a:last-child
      font-family: $font-family-serif
  color: $gray-dark
  max-width: 100%
  overflow: hidden
  img
    max-width: 100%
    padding: 0
  h1,
  h2,
  h3,
  h4,
  h5,
  h6
    font-weight: 600
    line-height: 1.25
    margin-top: 1.2rem
    margin-bottom: .8rem
  h1,
  h2
    border-bottom: 1px solid $border-color
    padding-bottom: 0.3rem
    margin-bottom: 1rem
  h1
    font-size: 1.75rem
  h2
    font-size: 1.5rem
  h3
    font-size: 1.25rem
  h4
    font-size: 1rem
  h5
    font-size: .9rem
  h6
    font-size: .8rem
  ul,
  ol
    margin-bottom: 1rem
  li+li
    margin-top: 0.25em
  pre
    padding: 1.2rem
    margin-bottom: 1rem
    background: $pre-bg
  blockquote
    padding: ($spacer / 2) $spacer
    margin-bottom: $spacer
    font-size: $blockquote-font-size
    border-left: $blockquote-border-width solid $blockquote-border-color
    color: $gray
    font-size: 1rem
    >:last-child
      margin-bottom: 0
    >:first-child
	    margin-top: 0
  table
    @extend .table
    @extend .table-bordered
  hr
    border-top-width: 3px
  iframe,
  embed
    display: block
    margin-top: 1.2rem
    margin-bottom: .8rem
    width: 720px
    height: 420px
    max-width: 100%
    max-height: 100%
    border: 0
  .task-list-item
    list-style-type: none
  .task-list-item-checkbox
    margin: 0 0.2em 0.25em -1.6em
    vertical-align: middle
  >*:first-child
    margin-top: 0 !important
  >*:last-child
    margin-bottom: 0 !important
  .note
    font-size: .8rem
    vertical-align: top
    position: relative
    top: -0.4em
  .footnotes
    margin-top: 1.4rem
    padding-top: 1.4rem
    border-top: 1px solid $btn-secondary-border


@include media-breakpoint-down(md)
  .markdown-content
    .toc:first-child
      float: none
      margin-left: 0

</style>
<script>
export default {
  props: {
    children: {
      type: String,
      default: '',
    },
    html: {
      type: Boolean,
      default: true,
    },
    editor: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      invisible: true,
      iframes: [],
      textChildren: false,
      prev: {
        children: '',
        innerHTML: '',
        html: true,
      }
    }
  },
  computed: {
    vhtml() {
      if (this.html) {
        return this.children
      }
      if (this.textChildren === false) {
        this.textChildren = this.children.replace(/<\/?\s*[a-zA-Z].*?>|[<>'"\r\n]/g, '')
      }
      return this.textChildren
    },
  },
  methods: {
    onResize() {
      this.iframes.forEach(function(iframe) {
        iframe.style.height = (iframe.clientWidth * 9 / 16).toString() + 'px';
      })
    },

    onLink() {
      var _this = this
      this.$el.querySelectorAll('a').forEach(function(link) {
        if (link.onclick) {
          return
        }
        link.onclick = function(e) {
          // don't redirect with control keys
          if (e.metaKey || e.ctrlKey || e.shiftKey) return
          // don't redirect when preventDefault called
          if (e.defaultPrevented) return
          // don't redirect on right click
          if (e.button !== undefined && e.button !== 0) return

          if (!this.getAttribute('target')) {
            this.setAttribute('target', '_blank')
          }

          if (this.host != window.location.host) {
            return
          }

          var href = this.getAttribute('href')
          if (!href) {
            return
          }

          if (_this.editor) {
            if (this.pathname == window.location.pathname && this.search == window.location.search) {
              e.preventDefault()
              return
            }
            return
          }

          e.preventDefault()
          if (this.pathname == window.location.pathname && this.search == window.location.search) {
            window.location.hash = this.hash
            return
          }
          _this.$router.push(this.pathname + this.search + this.hash)
        }
      })
    },

    onEvent() {
      this.iframes = this.$el.querySelectorAll('iframe,embed')
      this.onResize()
      this.onLink()
    },

    content() {
      var prev = this.prev
      var el = this.$el
      if (prev.html == this.html && prev.children == this.children &&  prev.innerHTML == el.innerHTML) {
        return
      }

      prev.html = this.html
      prev.children = this.children

      // 为空
      if (!this.children) {
        prev.innerHTML = el.innerHTML
        this.invisible = false
        return
      }

      // html
      if (this.html) {
        prev.innerHTML = el.innerHTML
        this.invisible = false
        this.onEvent()
        return
      }

      if (!__SERVER__) {
        require.ensure([], (require) => {
          const markdown = require('markdown-x');
          var token = markdown(this.children)
          token.toNode(el)
          prev.innerHTML = el.innerHTML
          this.invisible = false
          this.onEvent()
        }, 'markdown-x')
      }
    },
  },

  mounted() {
    window.addEventListener('resize', this.onResize)
    this.content()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
}
</script>
