import { defineStore } from "pinia";
import {
  PlayerInfo,
  PlayerState,
  RequestRawInfo,
  RoomDetailInfo,
} from "@/types/types";
import { makeRoomDetailInfo } from "@/utils/utils";
const usePlayerStateStore = defineStore({
  id: "playerStateStore",
  state: () => ({
    playerInfo: <PlayerInfo>{
      name: "null",
      id: "null",
      ready: false,
    },
    playerState: PlayerState.PENDING,
    playerInRoom: makeRoomDetailInfo({} as RequestRawInfo),
  }),
  getters: {
    getState: (state) => state.playerState,
  },
  actions: {
    updateAllState(newState: PlayerInfo) {
      Object.keys(this.playerInfo).forEach((v: string) => {
        if ((newState as PlayerInfo)[v] !== undefined) {
          this.playerInfo[v] = newState[v];
        }
      });
    },
    changePlayerState(newState: PlayerState) {
      this.playerState = newState;
      if (this.playerState === PlayerState.HANGING) {
        this.playerInRoom = <RoomDetailInfo>{};
      }
    },
    onPlayerEnterRoom(room: RoomDetailInfo) {
      this.playerInRoom = room;
    },
    onInRoomPlayerStateChanged(user_info: PlayerInfo) {
      const user = this.playerInRoom.roomDynamicState.users.find(
        (p) => p.id === user_info.id
      );
      if (user) {
        user.ready = user_info.ready;
      }
    },
    isAllPlayerReady():boolean{
      if(this.playerInRoom.roomDynamicState.users.length===0){
        return false;
      }else{
        return this.playerInRoom.roomDynamicState.users.reduce((pre:boolean,cur)=>pre&&cur.ready,true)
      }
    }
  },
});

const useRoomInfoStore = defineStore({
  id: "roomInfoStore",
  state: () => ({
    roomList: <Array<RoomDetailInfo>>[],
  }),
  getters: {
    getRoomById: (state) => {
      return (id: string) =>
        state.roomList.find((e) => e.roomBaseInfo.roomId === id);
    },
  },
  actions: {
    updateAllState(newStateArray: Array<RoomDetailInfo>) {
      this.roomList = newStateArray;
    },
  },
});

export { usePlayerStateStore, useRoomInfoStore };
