import * as type from './mutation-types'
export function selectPlay ({ commit, state }, { list, index }) {
  commit(type.SET_SEQUENCE_LIST, list)
  commit(type.SET_PLAYLIST, list)
  commit(type.SET_CURRENT_INDEX, index)
  commit(type.SET_FULL_SCREEN, true)
  commit(type.SET_PLAYING_STATE, true)
}