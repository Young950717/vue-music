<template>
  <scroll class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @scrollEnd="searchMore"
          @beforeScroll="listScroll"
          ref="suggest">
    <ul class="suggest-list">
      <li v-for="(item, idx) in result"
          @click="selectItem(item)"
          :key="idx"
          class="suggest-item">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text"
             v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore"
               :title="''"></loading>
    </ul>
    <div class="no-result-wrapper"
         v-show="!hasMore && !result.length">
      <no-result :title="noResultTitle"></no-result>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import { search } from 'api/search'
import { ERR_OK } from 'api/config'
import { mapMutations, mapActions } from 'vuex'
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
import Loading from 'base/loading/loading.vue'
import Singer from 'common/js/singer'
import NoResult from 'base/no-result/no-result.vue'
const PERPAGE = 20
const TYPE_SINGER = 'singer'
export default {
  name: 'suggest',
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  },
  data () {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      beforeScroll: true
    }
  },
  watch: {
    query: {
      handler () {
        this.search()
      }
    }
  },
  computed: {
    noResultTitle () {
      return `对不起，您搜索的 ${this.query} 暂无搜索结果`
    }
  },
  methods: {
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ]),
    search () {
      this.page = 1
      this.hasMore = true
      this.$refs.suggest.scrollTo(0, 0)
      search(this.query, this.page, this.showSinger, PERPAGE).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = result
            this._checkMore(res.data)
          })
        }
      })
    },
    getIconCls (item) {
      return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
    },
    getDisplayName (item) {
      return item.type === TYPE_SINGER ? item.singername : `${item.name}-${item.singer}`
    },
    searchMore () {
      if (!this.hasMore) return
      this.page++
      search(this.query, this.page, this.showSinger, PERPAGE).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = this.result.concat(result)
            this._checkMore(res.data)
          })
        }
      })
    },
    selectItem (item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.setSinger(singer)
        this.$router.push({
          path: `/search/${singer.id}`
        })
      } else {
        this.insertSong(item)
      }
    },
    listScroll () {
      this.$emit('listScroll')
    },
    _genResult (data) {
      let ret = []
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } })
      }
      return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
        ret = ret.concat(songs)
        return ret
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    _checkMore (data) {
      const song = data.song
      if (!song.list.length || (song.curnum + song.curpage * PERPAGE) > song.totalnum) {
        this.hasMore = false
      }
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
