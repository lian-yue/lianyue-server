<template>
  <div class="markdown ">
    <div class="form-control markdown-editor" ref="editor"></div>
  </div>
</template>
<style lang="sass">
@import "~codemirror/lib/codemirror.css"
@import "~codemirror/addon/dialog/dialog.css"
.markdown
  .markdown-editor
    padding: 0
  .storage-button
    margin-top: 1rem
</style>
<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
    },
    rows: {
      type: Number,
    },
    id: {
      type: String,
    },
    storage: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      editor: null
    }
  },
  watch: {
    value() {
      if (this.editor && this.editor.getValue() != this.value) {
        this.editor.setValue(this.value)
      }
    }
  },

  methods: {
    updateValue(value) {
      if (this.editor && this.editor.getValue() != value) {
        this.editor.setValue(value)
      }
      // 通过 input 事件发出数值
      this.$emit('input', value)
    }
  },

  mounted() {
    if (!__SERVER__) {
      require.ensure([], (require) => {
        const CodeMirror = require('codemirror');
        require('codemirror/mode/markdown/markdown');
        require('codemirror/mode/gfm/gfm');
        require('codemirror/addon/selection/active-line');
        require('codemirror/addon/display/placeholder');
        require('codemirror/addon/dialog/dialog');
        require('codemirror/addon/search/searchcursor');
        require('codemirror/addon/search/search');
        var editor = CodeMirror(this.$refs.editor, {
          lineNumbers: true,
          styleActiveLine: true,
          mode: "gfm",
          gitHubSpice: false,
          placeholder: this.placeholder,
          value: this.value,
        });
        this.editor = editor
        editor.setSize(null, (this.rows ? this.rows : 10) * 20);
        editor.on('change', () => {
          this.updateValue(editor.getValue())
        });
      }, 'codemirror-markdown')
    }
  }
}
</script>
