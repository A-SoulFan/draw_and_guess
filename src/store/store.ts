import { defineStore } from "pinia";
import {
  PlayerInfo,
  PlayerState,
  RequestRawInfo,
  RoomDetailInfo,
  ChatInfo,
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
    playerInRoomChatArray: [] as Array<ChatInfo>,
    pathInfo: [] as any,
    timer:0,
    timerId: null as any
  }),
  getters: {
    getState: (state) => state.playerState,
  },
  actions: {
    setTimer(tim: number){
      this.timer=tim
      this.timerId=setInterval(()=>{
        this.decTimer()
        if(this.timer===0){
          clearInterval(this.timerId)
        }
      },1000)
    },
    decTimer(){
      this.timer--;
    },
    updatePlayerInfo(newState: PlayerInfo) {
      Object.keys(this.playerInfo).forEach((v: string) => {
        if ((newState as PlayerInfo)[v]) {
          this.playerInfo[v] = "" + newState[v];
        }
      });
    },
    changePlayerState(newState: PlayerState) {
      this.playerState = newState;
      if (this.playerState === PlayerState.HANGING) {
        this.playerInRoom = <RoomDetailInfo>{};
        this.playerInRoomChatArray = <Array<ChatInfo>>[];
      }
    },
    onPlayerEnterRoom(room: RoomDetailInfo) {
      this.playerInRoom = room;
    },
    onGameOver(){
      this.playerInRoom.roomDynamicState.users.forEach(v=>{
        v.ready=false;
      })
    },
    onInRoomPlayerStateChanged(user_info: PlayerInfo) {
      const user = this.playerInRoom.roomDynamicState.users.find(
        (p) => p.id === user_info.id
      );
      if (user) {
        user.ready = user_info.ready;
      }
    },
    isAllPlayerReady(): boolean {
      if (this.playerInRoom.roomDynamicState.users.length === 0) {
        return false;
      } else {
        return this.playerInRoom.roomDynamicState.users.reduce(
          (pre: boolean, cur) => pre && cur.ready,
          true
        );
      }
    },
    isRoomOwner(): boolean {
      return this.playerInRoom.roomBaseInfo.onwerId === this.playerInfo.id;
    },
    appendChat(e: ChatInfo | Array<ChatInfo>) {
      if (Array.isArray(e)) {
        this.playerInRoomChatArray.push(...e);
      } else {
        this.playerInRoomChatArray.push(e);
      }
    },
    changeWordLib(e: string) {
      this.playerInRoom.roomDynamicState.wordLib = e;
    },
    changePath(e: any) {
      this.pathInfo = e;
    },
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
