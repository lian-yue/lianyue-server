<template>
<div :class="['loading', size, middle ? 'middle' : '']">
  <span class="circle">
  </span>
</div>
</template>
<script>
export default {
  props: {
    size: {
      type: String,
      default: 'md',
    },
    middle: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
