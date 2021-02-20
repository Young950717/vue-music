<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox"
                  @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper"
         ref="shortcutWrapper"
         v-show="!query">
      <scroll class="shortcut"
              :data="shortcut"
              :refreshDelay="refreshDelay"
              ref="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item"
                  @click="addQuery(item.k)"
                  v-for="item in hotkey"
                  :key="item.n">
                {{ item.k }}
              </li>
            </ul>
          </div>
          <div class="search-history"
               v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear"
                    @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory"
                         @select="addQuery"
                         @delete="deleteSearchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result"
         ref="searchResult"
         v-show="query">
      <suggest :query="query"
               ref="suggest"
               @listScroll="blurInput"
               @select="saveSearch"></suggest>
    </div>
    <confirm ref="confirm"
             :text="text"
             :confirmBtnText="'清空'"
             @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from 'base/search-box/search-box.vue'
import SearchList from 'base/search-list/search-list'
import Suggest from '../suggest/suggest'
import { getHotKey } from 'api/search'
import { ERR_OK } from 'api/config'
import { mapActions } from 'vuex'
import Confirm from 'base/confirm/confirm.vue'
import Scroll from 'base/scroll/scroll.vue'
import { playListMinxi, searchMixin } from 'common/js/mixin'

export default {
  name: 'search',
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  },
  mixins: [playListMinxi, searchMixin],
  created () {
    this._getHotKey()
  },
  data () {
    return {
      hotkey: [],
      text: ''
    }
  },
  watch: {
    query: {
      handler (newQuery) {
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    }
  },
  computed: {
    shortcut () {
      return this.hotkey.concat(this.searchHistory)
    }
  },
  methods: {
    ...mapActions(['clearSearchHistory']),
    handlePlayList (playList) {
      const bottom = playList.length > 0 ? '60px' : 0
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()
      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest.refresh()
    },
    showConfirm () {
      this.text = '确定要删除全部搜索历史吗？'
      this.$refs.confirm.show()
    },
    _getHotKey () {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotkey = res.data.hotkey.slice(0, 10)
        }
      })
    }
  }

}
</script>
<style lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.search {
  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;

    .shortcut {
      height: 100%;
      overflow: hidden;

      .hot-key {
        margin: 0 20px 20px 20px;

        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }

      .search-history {
        position: relative;
        margin: 0 20px;

        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;

          .text {
            flex: 1;
          }

          .clear {
            extend-click();

            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>
