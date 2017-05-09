import { TOKEN } from '../types'
export default {
  async [TOKEN]({commit}, payload) {
    var token = await commit.fetch('/token', {create: payload.create})
    commit({
      type: TOKEN,
      token,
    })
  }
}
