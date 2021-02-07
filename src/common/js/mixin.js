import { mapGetters } from 'vuex'
export const playListMinxi = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  watch: {
    playList: {
      handler (newVal) {
        this.handlePlayList(newVal)
      }
    }
  },
  mounted () {
    this.handlePlayList(this.playList)
  },
  activated () {
    this.handlePlayList(this.playList)
  },
  methods: {
    handlePlayList () {
      throw new Error('component must be implement handlePlayList method')
    }
  },
}