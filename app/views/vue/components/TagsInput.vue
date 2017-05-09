<template>
<div class="form-group">
  <div class="input-group">
    <input type="text" class="form-control" :id="id" :name="name" autocomplete="off" v-model="addTags" @keydown.enter="onAdd" />
    <div class="input-group-btn">
      <button type="button" class="btn btn-secondary" @click="onAdd">
        添加
      </button>
    </div>
  </div>
  <p class="form-text">多个标签请用英文逗号（<code>,</code>）分开</p>
  <div class="tags-input-list">
    <span  v-for="(tag, key) in value" :key="key" v-if="tag && tag.names && tag.names.length && !tag.add" class="name">{{tag.names[0]}}<span @click="onRemove(tag)">×</span></span>
  </div>
</div>
</template>
<style lang="sass">
@import "../styles/variables"
.tags-input-list
  .name
    background-color: $link-color
    color: #fff
    display: inline-block
    border-radius: .25rem
    padding: .2rem 0rem .2rem .75rem
    margin-right: 1rem
    margin-bottom: .6rem
    span
      cursor: pointer
      display: inline-block
      padding: 0 .4rem
</style>
<script>
export default {
  props: {
    id: {
      default: '',
    },
    name: {
      default: '',
    },
    value: {
      type: Array,
      default: Array,
    },
  },

  data() {
    return {
      addTags: '',
    }
  },

  watch:{
    addTags() {
      var addTags = this.addTags
        .split(/'|"|;|:|,|\.|\/|\?|!|#|`|｀|；|：|’|‘|“|”|，|。|／|？/)
        .map(name => name.trim())
        .filter(name => name)
        .map(name => ({names: [name], add: true}))

      var tags = this.value
        .filter(tag => !tag.add)

      tags = tags.concat(addTags)


      var names = {}
      tags = tags.filter(function(tag) {
        if (!tag || !tag.names.length) {
          return
        }
        for (var i = 0; i < tag.names.length; i++) {
          let name = tag.names[i]
          if (names[name]) {
            return false
          }
          names[name] = true
        }
        return true
      })

      this.updateValue(tags)
    }
  },
  

  methods: {
    updateValue(value) {
      this.$emit('input', value)
    },

    onAdd(e) {
      e.preventDefault()
      var tags = this.value.map(function(tag) {
        delete tag.add
        return tag
      })
      this.addTags = ''
      this.updateValue(tags)
    },
    onRemove(tag) {
      var index = this.value.indexOf(tag)
      if (index != -1) {
        this.value.splice(index, 1)
        this.updateValue(this.value)
      }
    }
  },
}
</script>
