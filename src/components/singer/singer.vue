<template>
  <div class="singer"
       ref="singer">
    <list-view :data="singers"
               @select="selectSinger"
               ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from 'api/singer'
import { ERR_OK } from 'api/config'
import { mapMutations } from 'vuex'
import Singer from 'common/js/singer'
import { playListMinxi } from 'common/js/mixin'
import ListView from 'base/listView/listView'
const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10
export default {
  name: 'singer',
  components: {
    ListView
  },
  mixins: [playListMinxi],
  data () {
    return {
      singers: []
    }
  },
  created () {
    this._getSingerList()
  },
  methods: {
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    handlePlayList (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    selectSinger (singer) {
      this.setSinger(singer)
      this.$router.push({
        path: `/singer/${singer.id}`
      })
    },
    _getSingerList () {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
        }
      })
    },
    _normalizeSinger (list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, idx) => {
        if (idx < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({ id: item.Fsinger_mid, name: item.Fsinger_name }))
        }
        const key = item.Findex
        if (!map[key]) {
          // 不存在就初始化
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({ id: item.Fsinger_mid, name: item.Fsinger_name }))
      })
      // console.log(map)
      // 为了得到有序列表 需要处理map
      let hot = []
      let ret = []
      for (const key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt() - b.title.charCodeAt()
      })
      return hot.concat(ret)
    }
  }
}
</script>

<style lang="stylus" scoped>
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>