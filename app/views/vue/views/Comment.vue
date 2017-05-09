<template>
<div id="app">

  <router-link to="/">home</router-link>
  <router-link to="/www">www</router-link>
  <router-view></router-view>
</div>
</template>

<style lang="sass" scoped>
$www: #111

.red
  color: red
.animate
  color: $www
  animation: fade 1s
</style>
