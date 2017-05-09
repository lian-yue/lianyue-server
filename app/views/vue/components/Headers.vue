<script>
import {HEADERS} from '../store/types'
export default {
  props: {
    status: {
      type: Number,
      default: 200,
    },
    html: {
      type: Object,
      default: Object,
    },
    title: {
      type: Array,
      default: Array,
    },
    meta: {
      type: Array,
      default: Array,
    },
    link: {
      type: Array,
      default: Array,
    },
    breadcrumb: {
      type: Array,
      default: Array,
    },
    separator: {
      type: String,
      default: ' - ',
    }
  },
  created() {
    this.update()
  },
  beforeUpdate() {
    this.update()
  },
  methods: {
    update() {
      this.$store.commit({...this.$props, type: HEADERS})
    }
  },
  render(h) {
    return null
  },

}
</script>
