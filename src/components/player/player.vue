<template>
  <div class="player"
       v-show="playList.length">
    <transition appear
                name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player"
           v-show="fullScreen">
        <div class="background">
          <img width="100%"
               height="100%"
               :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back"
               @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title"
              v-html="currentSong.name"></h1>
          <h2 class="subtitle"
              v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchstart"
             @touchmove.prevent="middleTouchmove"
             @touchend.prevent="middleTouchend">
          <div class="middle-l"
               ref="middleL">
            <div class="cd-wrapper"
                 ref="cdWrapper">
              <div class="cd">
                <img class="image"
                     :class="cdCls"
                     :src="currentSong.image" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>
          <scroll class="middle-r"
                  :data="currentLyric && currentLyric.lines"
                  ref="lyricList">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p v-for="(line,idx) in currentLyric.lines"
                   :key="idx"
                   ref="lyricLine"
                   :class="{ current:currentLineNum === idx }"
                   class="text">{{ line.txt  }}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot"
                  :class="{ active: currentShow === 'cd' }"></span>
            <span class="dot"
                  :class="{ active: currentShow === 'lyric' }"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent"
                            @percentChange="onProgressChange"></progress-bar>
            </div>
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left"
                 @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left"
                 :class="disableCls">
              <i @click="prev"
                 class="icon-prev"></i>
            </div>
            <div class="icon i-center"
                 :class="disableCls">
              <i @click="togglePlaying"
                 :class="playIcon"></i>
            </div>
            <div class="icon i-right"
                 :class="disableCls">
              <i @click="next"
                 class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition appear
                name="mini">
      <div class="mini-player"
           @click="open"
           v-show="!fullScreen">
        <div class="icon">
          <div class="imgWrapper">
            <img width="40"
                 height="40"
                 :src="currentSong.image"
                 :class="cdCls" />
          </div>

        </div>
        <div class="text">
          <h2 class="name"
              v-html="currentSong.name"></h2>
          <p class="desc"
             v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progressCircle :radius="32"
                          :percent="percent">
            <i @click.stop="togglePlaying"
               class="icon-mini"
               :class="miniIcon"></i>
          </progressCircle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio"
           :src="currentSong.url"
           @playing="ready"
           @error="error"
           @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom'
import progressBar from 'base/progress-bar/progress-bar'
import progressCircle from 'base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/utils'
import Scroll from 'base/scroll/scroll'
import Lyric from 'lyric-parser'
const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
export default {
  name: 'player',
  created () {
    this.touch = {}
  },
  data () {
    return {
      songReady: false,
      currentTime: 0,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: '',
      isPureMusic: false,// 纯音乐
      pureMusicLyric: ''
    }
  },
  components: {
    progressBar,
    progressCircle,
    Scroll
  },
  computed: {
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    ...mapGetters([
      'fullScreen',
      'playList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList'
    ])
  },
  watch: {
    currentSong: {
      handler (newSong, oldSong) {
        if (!newSong.id || !newSong.url || newSong.id === oldSong.id) return
        this.$refs.lyricList.scrollTo(0, 0, 1000)
        this.songReady = false
        this.canLyricPlay = false
        if (this.currentLyric) {
          this.currentLyric.stop()
          // 重置为null
          this.currentLyric = null
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        this.$nextTick(() => {
          this.$refs.audio.src = newSong.url
          this.$refs.audio.play()
        })
        if (!this.playing) {
          this.setPlayingState(true)
        }
        // 若歌曲 5s 未播放，则认为超时，修改状态确保可以切换歌曲。
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.songReady = true
        }, 5000)
        this.getLyric()
        // this.$nextTick(() => {
        //   this.$refs.audio.play()
        //   this.getLyric()
        // })
      }
    },
    playing: {
      handler (newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    }
  },
  methods: {
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    getLyric () {
      this.currentSong.getLyric().then(lyric => {
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        this.isPureMusic = !this.currentLyric.lines.length
        if (this.isPureMusic) {
          this.pureMusicLyric = this.currentLyric.lrc.replace(timeExp, '').trim()
          this.playingLyric = this.pureMusicLyric
        } else {
          if (this.playing && this.canLyricPlay) {
            // 这个时候有可能用户已经播放了歌曲，要切到对应位置
            this.currentLyric.seek(this.currentTime * 1000)
          }
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    handleLyric ({ lineNum, txt }) {
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    back () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
    enter (el, done) {
      const { x, y, scale } = this._getPosScale()
      let animation = {
        0: { // 初始位置
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {  //60%的时候
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      const timer = setTimeout(done, 400)
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
        clearTimeout(timer)
        done()
      })

    },
    afterLeave () {
      this.$refs.cdWrapper.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    togglePlaying () {
      if (!this.songReady) return
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
      this.setPlayingState(!this.playing)
    },
    prev () {
      if (!this.songReady) return
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playList.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = true
    },
    next () {
      if (!this.songReady) return
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        if (index === this.playList.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = true
    },
    ready () {
      clearTimeout(this.timer)
      this.songReady = true
      // 增加一个标识位处理当歌曲加载晚于歌词的情况
      this.canLyricPlay = true
      // 如果歌曲的播放晚于歌词的出现，播放的时候需要同步歌词
      if (this.currentLyric && !this.isPureMusic) {
        this.currentLyric.seek(this.currentTime * 1000)
      }
    },
    error () {
      this.songReady = true
    },
    end () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    format (interval) {
      interval = interval | 0  // 向下取整
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    onProgressChange (percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
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
    middleTouchstart (e) {
      this.touch.initialed = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchmove (e) {
      if (!this.touch.initialed) return
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) return
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchend () {
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        if (this.touch.percent < 0.9) {
          opacity = 1
          offsetWidth = 0
          this.currentShow = 'cd'
        } else {
          opacity = 0
          offsetWidth = -window.innerWidth
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },
    // 补位
    _pad (num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    _getPosScale () {
      const targetWidth = 40,
        paddingLeft = 40,
        paddingBottom = 30,
        paddingTop = 80,
        width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }

            .play {
              animation: rotate 20s linear infinite;
            }

            .pause {
              animation-play-state: paused;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }

          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;

          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;

      .imgWrapper {
        height: 100%;
        width: 100%;

        img {
          border-radius: 50%;

          &.play {
            animation: rotate 10s linear infinite;
          }

          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

