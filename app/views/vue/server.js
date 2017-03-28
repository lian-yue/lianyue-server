import fs from 'fs'
import Vue from 'vue'
import {createRenderer} from 'vue-server-renderer'

import App from './views/App.vue'

const renderer = createRenderer({
  template: fs.readFileSync('./theme.html', 'utf-8')
})



export default async function(inlineState, ctx) {

  const vm = new Vue(App)

  const stream = renderer.renderToStream(vm)

  return {body: stream}
}
