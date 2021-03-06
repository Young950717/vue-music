import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/utils'
import {
  saveSearch,
  deleteSearch,
  clearSearch,
  savePlay,
  saveFavorite,
  deleteFavorite

} from 'common/js/cache'
function findIndex (list, song) {
  return list.findIndex(item => item.id === song.id)
}

export function selectPlay ({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
export function randomPlay ({ commit }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export function insertSong ({ commit, state }, song) {
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playList[currentIndex]

  // 查找当前列表中是否有待插入的歌曲
  let fpIndex = findIndex(playList, song)

  // 插入
  currentIndex++
  playList.splice(currentIndex, 0, song)

  if (fpIndex > -1) {
    // 存在的话，删掉在原来列表的位置
    if (currentIndex > fpIndex) {
      playList.splice(fpIndex, 1)
      currentIndex--
      // 插入的序号大于列表中的序号
    } else {
      playList.splice(fpIndex + 1, 1)
    }
  }
  // sequenceList同理
  // 获得插入的位置
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      // 插在后面
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export function saveSearchHistory ({ commit }, query) {
  if (!query) return
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export function deleteSearchHistory ({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export function clearSearchHistory ({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export function deleteSong ({ commit, state }, song) {
  // debugger
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playList, song)
  playList.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  if (currentIndex > pIndex || currentIndex === playList.length) {
    currentIndex--
  }
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  const playingState = playList.length > 0
  commit(types.SET_PLAYING_STATE, playingState)

}

export function deleteSongList ({ commit }) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

export function savePlayHistory ({ commit }, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export function saveFavoriteList ({ commit }, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}
export function deleteFavoriteList ({ commit }, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}