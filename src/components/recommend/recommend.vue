<template>
  <div class="recommend">
    <scroll ref="scroll"
            class="recommend-content"
            :data="discList">
      <div>
        <div v-if="recommends.length"
             class="slider-wrapper">
          <div class="slider-content">
            <slider>
              <div v-for="item in recommends"
                   :key="item.id"
                   class="slider-item">
                <a :href="item.linkUrl"></a>
                <img class="needsclick"
                     @load="imgLoad"
                     v-lazy="item.picUrl">
              </div>
            </slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌曲推荐</h1>
          <ul>
            <li class="item"
                v-for="item in discList"
                :key="item.dissid">
              <div class="icon">
                <img width="60"
                     height="60"
                     :src="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name"
                    v-html="item.creator.name"></h2>
                <span class="desc"
                      v-html="item.dissname"></span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container"
           v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import { getRecommend, getDiscList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import Slider from 'base/slider/slider'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
export default {
  components: {
    Slider,
    Scroll,
    Loading
  },
  created () {
    this._getRecommend()
    this._getDiscList()
  },
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  methods: {
    _getRecommend () {
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    _getDiscList () {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          // 没那么多数据，造重复的人为制造一点高度
          for (let i = 0; i < 10; i++) {
            this.discList.push(res.data.list[0])
          }
          // this.discList = res.data.list
        }
      })
    },
    // 当某张图片加载完之后触发load事件，然后就可以去触发scroll的refresh事件重新计算高度了
    imgLoad () {
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }

    }
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 40%;
      overflow: hidden;

      .slider-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }

      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }

        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;

          .name {
            margin-bottom: 10px;
            color: $color-text;
          }

          .desc {
            color: $color-text-d;
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
