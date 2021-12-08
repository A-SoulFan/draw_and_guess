<template>
  <div class="mainPage">
    <in-room
      v-if="
        playerStateStore.playerState === PlayerState.INROOM_WAITING ||
        playerStateStore.playerState === PlayerState.INROOM_READY
      "
      class="inRoomBox"
      @on-ready-change="onReadyChange"
      @on-exit-room="onExitRoom"
    ></in-room>
    <div class="leftBar">
      <component
        v-show="isSettingOpen"
        :is="leftCurrentView"
        class="controlBar"
        @state-handler="changeSettingConpShowState"
      ></component>
      <img
        class="leftBarBackground"
        src="../../assets/Draw/LeftBackground.png"
      />
      <div class="setting" @click="changeSettingConpShowState">
        <img src="../../assets/Draw/setting.png" />
      </div>
      <img class="leftBarLine" src="../../assets/Draw/LeftBarLine.png" />
      <img class="leftBarDrawLogo" src="../../assets/Draw/DrawLogo.png" />
    </div>
    <div class="rightBar">
      <component
        :is="rightCurrentView"
        @on-create-room="onCreateRoom"
        @on-enter-room="onEnterRoom"
        class="roomComp"
      ></component>
      <img class="backgroundASF" src="../../assets/Draw/backgroundASF.png" />
    </div>
    <img class="logoASF" src="../../assets/Draw/LOGO.png" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import controlBar from "../../components/DrawComponents/ControlBar.vue";
import roomList from "../../components/DrawComponents/RoomList.vue";
import inRoom from "../../components/DrawComponents/InRoom.vue";
import {
  PlayerInfo,
  RoomDetailInfo,
  RoomDynamicState,
  RoomBaseInfo,
  RespondRawInfo,
  RequestRawInfo,
  PlayerState,
} from "../../types/types";
import { usePlayerStateStore, useRoomInfoStore } from "../../store/store";
import { makeRoomDetailInfo } from "../../utils/utils";

export default defineComponent({
  name: "drawMain",
  components: {
    controlBar,
    roomList,
    inRoom,
  },
  setup() {
    let isSettingOpen = ref(false);
    let intervalLoopId = null;
    let leftCurrentView = "controlBar";
    let rightCurrentView = "roomList";
    const websocketClient = new WebSocket("ws://localhost:1001");
    const playerStateStore = usePlayerStateStore();
    const roomInfoStore = useRoomInfoStore();
    const changeSettingConpShowState = () => {
      if (isSettingOpen.value) {
        isSettingOpen.value = false;
      } else {
        isSettingOpen.value = true;
      }
    };
    const onCreateRoom = function (e: RequestRawInfo) {
      websocketClient.send(
        JSON.stringify({
          api_type: "makenewroom",
          param: {
            room_name: e.room_name,
            round: `${e.round}`,
            draw_time: `${e.draw_time}`,
            max_users: `${e.max_users}`,
          },
        })
      );
    };
    const onEnterRoom = function (e: string) {
      websocketClient.send(
        JSON.stringify({
          api_type: "joinroom",
          param: {
            id: e,
          },
        })
      );
    };
    const onReadyChange = function () {
      websocketClient.send(
        JSON.stringify({
          api_type: "ready",
          param: {
            nil: "nil",
          },
        })
      );
    };
    const onExitRoom = function () {
      websocketClient.send(
        JSON.stringify({
          api_type: "exitroom",
          param: {
            nil: "nil",
          },
        })
      );
      playerStateStore.changePlayerState(PlayerState.HANGING);
    };
    onMounted((): void => {
      websocketClient.onopen = () => {
        websocketClient.send("asoulFanToken=123456");
      };
      
      websocketClient.onmessage = (evt) => {
        let datas = JSON.parse(evt.data);
        console.log(datas)
        switch (datas.api) {
          case "connect":
            intervalLoopId = setInterval(() => {
              websocketClient.send('{"api_type": "getallrooms"}');
            }, 5000);
            playerStateStore.changePlayerState(PlayerState.HANGING);
            break;
          case "getAllRooms" || "roomUpdate":
            (function () {
              if (playerStateStore.playerState !== PlayerState.HANGING) {
                return;
              }
              let roomInfo = datas.data.rooms_info;
              if (roomInfo) {
                roomInfoStore.updateAllState(
                  roomInfo.map((v: RespondRawInfo) => {
                    return makeRoomDetailInfo(v);
                  })
                );
              }
            })();
            break;
          case "makeNewRoom":
            (function () {
              let roomInfo = datas.data;
              if (roomInfo) {
                playerStateStore.changePlayerState(PlayerState.INROOM_WAITING);
                playerStateStore.onPlayerEnterRoom(
                  makeRoomDetailInfo(roomInfo)
                );
              }
            })();
            break;
          case "joinRoom":
            (function () {
              let roomInfo = datas.data;
              if (roomInfo) {
                roomInfo.draw_time = (function (drawTime) {
                  //处理时间格式'xxxmyyys'
                  if (drawTime) {
                    let drawTimeMinute = parseInt(
                      /[0-9]{0,3}m/.exec(drawTime) as any as string
                    );
                    let drawTimeSecond = parseInt(
                      /[0-9]{0,3}s/.exec(drawTime) as any as string
                    );
                    if (isNaN(drawTimeMinute) && isNaN(drawTimeSecond)) {
                      throw new Error(`inValid draw_time:${drawTime}`);
                    } else {
                      return `${
                        (drawTimeMinute || 0) * 60 + (drawTimeSecond || 0)
                      }`;
                    }
                  }
                })(roomInfo.draw_time);
                playerStateStore.changePlayerState(PlayerState.INROOM_WAITING);
                playerStateStore.onPlayerEnterRoom(
                  makeRoomDetailInfo(roomInfo)
                );
              }
            })();
            break;
          case "inRoomInfoUpdate":
            (function () {
              let roomInfo = datas.data;
              if (roomInfo) {
                roomInfo.draw_time = (function (drawTime) {
                  if (drawTime) {
                    let drawTimeMinute = parseInt(
                      /[0-9]{0,3}m/.exec(drawTime) as any as string
                    );
                    let drawTimeSecond = parseInt(
                      /[0-9]{0,3}s/.exec(drawTime) as any as string
                    );
                    if (isNaN(drawTimeMinute) && isNaN(drawTimeSecond)) {
                      throw new Error(`inValid draw_time:${drawTime}`);
                    } else {
                      return `${
                        (drawTimeMinute || 0) * 60 + (drawTimeSecond || 0)
                      }`;
                    }
                  }
                })(roomInfo.draw_time);
                playerStateStore.onPlayerEnterRoom(
                  makeRoomDetailInfo(roomInfo)
                );
              }
            })();
            break;
          case "exit_room":
            break;
          case "user_ready":
            (function () {
              let roomInfo = datas.data.user_info as PlayerInfo;
              if (roomInfo) {
                playerStateStore.onInRoomPlayerStateChanged(roomInfo);
                if(playerStateStore.isAllPlayerReady()){
                  websocketClient.send(JSON.stringify({
                      "api_type": "startgame",
                      "param": {
                          "nil": "nil"
                      }
                    }
                  ))
                }
              }
            })();
            break;
        }
      };
    });
    return {
      websocketClient,
      intervalLoopId,
      playerStateStore,
      roomInfoStore,
      leftCurrentView,
      rightCurrentView,
      isSettingOpen,
      changeSettingConpShowState,
      onCreateRoom,
      PlayerState,
      onEnterRoom,
      onReadyChange,
      onExitRoom,
    };
  },
});
</script>

<style scoped>
.mainPage {
  background-color: rgb(230, 230, 230);
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
  z-index: 0;
}
.mainPage .logoASF {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 5%;
  z-index: 10000;
}
.leftBar {
  flex: 1 1 56%;
  position: relative;
}
.rightBar {
  flex: 1 1 44%;
  position: relative;
}
.rightBar .backgroundASF {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  z-index: -1;
  margin-top: -30%;
}
.leftBar .leftBarLine {
  position: absolute;
  width: 100%;
  left: 0;
  z-index: -1;
}
.leftBar .leftBarDrawLogo {
  position: absolute;
  width: 50%;
  left: 50%;
  top: 25%;
  z-index: -1;
  transform: translateX(-50%);
}
.leftBar .leftBarBackground {
  position: absolute;
  width: 100%;
  left: 0;
  opcaity: 0.99;
  z-index: -1;
}
.roomComp {
  height: 100%;
  margin-top: 10%;
}
.setting {
  position: absolute;
  right: 15px;
  bottom: 5px;
}
.setting img {
  width: 30px;
}
.setting:hover {
  cursor: pointer;
}
.controlBar {
  position: absolute;
  height: 80%;
  top: 10%;
  right: 10%;
}
.inRoomBox {
  z-index: 99;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
