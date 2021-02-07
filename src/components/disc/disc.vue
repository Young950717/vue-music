<template>
  <transition name="slider"
              appear>
    <music-list :title="title"
                :bgImage="bgImage"
                :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from '../music-list/music-list'
import { mapGetters } from 'vuex'
import { getSongList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
export default {
  name: 'disc',
  created () {
    this._getSongList()
  },
  data () {
    return {
      songs: []
    }
  },
  computed: {
    ...mapGetters([
      'disc'
    ]),
    title () {
      return this.disc.dissname
    },
    bgImage () {
      return this.disc.imgurl
    }
  },
  components: {
    MusicList
  },
  methods: {
    _getSongList () {
      if (!this.disc.dissid) {
        this.$router.back()
      }
      getSongList(this.disc.dissid).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach(musicData => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  }
}
</script>

<style lang="stylus" scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>