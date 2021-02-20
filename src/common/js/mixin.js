import { mapGetters, mapActions, mapMutations } from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/utils'
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
export const playerMixin = {
  computed: {
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'mode',
      'playList'
    ]),
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },

  },
  methods: {
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    changeMode () {
      const mode = (this.mode + 1) % 3
      // debugger
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    resetCurrentIndex (list) {
      let index = list.findIndex(item => item.id === this.currentSong.id)
      this.setCurrentIndex(index)
    },
  },
}

export const searchMixin = {
  data () {
    return {
      query: ''
    }
  },
  computed: {
    ...mapGetters(['searchHistory']),
  },
  methods: {
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
    ]),
    blurInput () {
      this.$refs.searchBox.blur()
    },
    saveSearch () {
      this.saveSearchHistory(this.query)
    },
    onQueryChange (query) {
      this.query = query
      this.saveSearchHistory(query)
    },
    addQuery (key) {
      this.$refs.searchBox.setQuery(key)
    }
  },
}