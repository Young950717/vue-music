import { playMode } from 'common/js/config'
const state = {
  singer: {},
  playing: false, // 播放状态
  fullScreen: false, //是否全屏
  playList: [], // 播放列表
  sequenceList: [], //顺序列表
  mode: playMode.sequence, // 播放模式
  currentIndex: -1,
  disc: {}, // 推荐歌单详情
  topList: {} // 排行榜歌单详情

}
export default state